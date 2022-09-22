<?php

namespace App\Services;

use App\DTO\Money;
use App\Enums\AuctionStatusEnum;
use App\Events\BidPlaced;
use App\Exceptions\NoCurrencyException;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Currency;
use App\Models\User;
use App\Repositories\AuctionRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuctionService
{
    public function __construct(private CurrencyService $currencyService, private AuctionRepository $auctionRepository)
    {
    }

    /** @noinspection PhpIncompatibleReturnTypeInspection */
    public function create(User $user, array $data): Auction
    {
        $currency = $this->currencyService->getCurrencyFromId((int) $data['currency_id']);
        if ($currency === null) {
            // We shouldn't need to do this as the data would have been validated,
            // however this is belt and braces and to keep PhpStan happy
            throw new NoCurrencyException;
        }
        $data['starts'] = (new Carbon($data['starts']))
            ->setSecond(0)
            ->setTimezone('UTC');
        // Just check the time the auction is going to start is not in the past. This may happen as
        // we have set the seconds to 00 so in case we just need to check and add an extra minute
        if ($data['starts']->isBefore(Carbon::now('UTC'))) {
            // Just add a minute to the current time and set the seconds
            // to 0. This will ensure the start time is not in the past.
            $data['starts'] = Carbon::now('UTC')->addMinute()->setSecond(0);
        }
        $data['auction_status_id'] = AuctionStatusEnum::PENDING;
        $data['reserve_price'] = $this->ensurePriceIsMoneyInstance($data['reserve_price'], $currency);
        $data['starting_price'] = $this->ensurePriceIsMoneyInstance($data['starting_price'], $currency);
        return $user->auctions()->create($data);
    }

    public function getAll(int $perPage, array $statuses = []): LengthAwarePaginator
    {
        if (empty($statuses)) {
            $statuses = [AuctionStatusEnum::PENDING, AuctionStatusEnum::ACTIVE];
        }
        array_walk($statuses, function (AuctionStatusEnum $status, int $key) use (&$statuses) {
            $statuses[$key] = $status->value;
        });
        return $this->auctionRepository->getAll($perPage, $statuses);
    }

    public function placeBid(Auction $auction, User $user, string $price): Bid
    {
        if ($auction->currency === null) {
            // The only time this will be null is when creating a new currency
            throw new NoCurrencyException;
        }
        /** @var Bid $bid */
        $bid = $auction->bids()
            ->create([
                'user_id' => $user->id,
                'price' => $this->ensurePriceIsMoneyInstance($price, $auction->currency)
            ]);

        BidPlaced::dispatch($bid);

        return $bid;
    }

    private function ensurePriceIsMoneyInstance(mixed $price, Currency $currency): Money
    {
        if ($price instanceof Money) {
            return $price;
        }
        return new Money((string)$price, $currency);
    }
}
