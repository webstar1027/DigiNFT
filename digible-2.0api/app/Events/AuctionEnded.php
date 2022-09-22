<?php

namespace App\Events;

use App\Models\Auction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionEnded
{
    use Dispatchable, SerializesModels;

    public function __construct(public Auction $auction)
    {

    }
}
