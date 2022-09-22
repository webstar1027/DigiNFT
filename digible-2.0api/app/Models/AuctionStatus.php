<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection as DbCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Action;

/**
 * @property int $id
 * @property string $name
 *
 * @property DbCollection|Auction[] $auctions
 *
 * @mixin \Eloquent
 */
class AuctionStatus extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name'
    ];

    public function auctions(): HasMany
    {
        return $this->hasMany(Action::class);
    }
}
