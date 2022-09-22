<?php

namespace App\Models;

use App\Casts\MoneyCast;
use App\DTO\Money;
use App\Enums\AuctionStatusEnum;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection as DbCollection;

/**
 * @property int $id
 * @property string $uuid
 * @property int $user_id
 * @property int $collection_item_id
 * @property AuctionStatusEnum $auction_status_id
 * @property Carbon $starts
 * @property int $period_minutes
 * @property Money $reserve_price
 * @property Money $starting_price
 * @property int $currency_id
 * @property ?bool $sold
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property User $user
 * @property ?Currency $currency
 * @property CollectionItem $collectionItem
 * @property DbCollection $bids
 *
 * @mixin \Eloquent
 */
class Auction extends AbstractUuidModel implements CurrencyInterface
{
    use HasFactory;

    private ?CarbonImmutable $endDateTime = null;

    private Money|null $topBid = null;

    protected $casts = [
        'starts' => 'datetime',
        'auction_status_id' => AuctionStatusEnum::class,
        'sold' => 'boolean',
        'reserve_price' => MoneyCast::class,
        'starting_price' => MoneyCast::class,
    ];

    protected $fillable = [
        'collection_item_id',
        'auction_status_id',
        'starts',
        'period_minutes',
        'reserve_price',
        'starting_price',
        'currency_id',
        'sold'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function collectionItem(): BelongsTo
    {
        return $this->belongsTo(CollectionItem::class);
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function getCurrency(): ?Currency
    {
        if ($this->currency === null && ($this->currency_id ?? null)) {
            $this->load('currency');
        }
        return $this->currency ?? null;
    }

    public function getTopBidValue(): Money
    {
        if (!$this->topBid) {
            /** @var Bid|null $topBid */
            $topBid = $this->bids()
                ->orderBy('price', 'DESC')
                ->first();
            $this->topBid = $topBid !== null ?
                $topBid->price :
                Money::make('0', $this->getCurrency()); // @phpstan-ignore-line
        }

        return $this->topBid;
    }

    public function getEndDateTime(): CarbonImmutable
    {
        if ($this->endDateTime === null) {
            $this->endDateTime = new CarbonImmutable($this->starts->clone()->addMinutes($this->period_minutes));
        }
        return $this->endDateTime;
    }

    public function getEndDateTimeFormatted(string $format = DateTimeInterface::ATOM): string
    {
        return $this->getEndDateTime()->format($format);
    }

    public function getStartDateTimeFormatted(string $format = DateTimeInterface::ATOM): string
    {
        return $this->starts->format($format);
    }

    public function hasEnded(): bool
    {
        return $this->auction_status_id === AuctionStatusEnum::ENDED ||
            $this->getEndDateTime()->isBefore(Carbon::now('UTC'));
    }

    public function hasStarted(): bool
    {
        return $this->auction_status_id === AuctionStatusEnum::ACTIVE ||
            Carbon::now('UTC')->isBetween($this->starts, $this->getEndDateTime());
    }
}
