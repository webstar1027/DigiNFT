<?php

namespace App\Services;

use App\Enums\AuctionStatusEnum;
use App\Events\AuctionEnded;
use App\Events\AuctionStarted;
use App\Models\Auction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as DbCollection;

class AuctioneerService
{
    public function processAuctionsForStatusChange(): void
    {
        $this->startPendingAuctions()
            ->stopActiveAuctions();
    }

    private function startPendingAuctions(): self
    {
        $startDate = Carbon::now()->setTimezone('UTC');
        /** @var DbCollection|Auction[] $auctions */
        $auctions = Auction::where('auction_status_id', AuctionStatusEnum::PENDING->value)
            ->where('starts', '<=', $startDate)
            ->get();

        foreach ($auctions as $auction) {
            $auction->auction_status_id = AuctionStatusEnum::ACTIVE;
            $auction->save();
            AuctionStarted::dispatch($auction);
        }

        return $this;
    }

    private function stopActiveAuctions(): self
    {
        $endsDate = Carbon::now()->setTimezone('UTC')->format('Y-m-d H:i:s');
        $auctions = Auction::where('auction_status_id', AuctionStatusEnum::ACTIVE->value)
            ->whereRaw("date_add(`starts`, interval `period_minutes` minute) <= '$endsDate'")
            ->get();

        foreach ($auctions as $auction) {
            $auction->auction_status_id = AuctionStatusEnum::ENDED;
            $auction->save();
            AuctionEnded::dispatch($auction);
        }

        return $this;
    }
}
