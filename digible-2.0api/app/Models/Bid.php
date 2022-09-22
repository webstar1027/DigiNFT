<?php

namespace App\Models;

use App\Casts\MoneyCast;
use App\DTO\Money;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $auction_id
 * @property int $user_id
 * @property Money $price
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property ?Auction $auction
 * @property User $user
 *
 * @mixin \Eloquent
 */
class Bid extends Model implements CurrencyInterface
{
    protected $fillable = [
        'user_id',
        'price'
    ];

    protected $casts = [
        'price' => MoneyCast::class
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auction(): BelongsTo
    {
        return $this->belongsTo(Auction::class);
    }

    public function getCurrency(): ?Currency
    {
        return $this->auction?->currency;
    }
}
