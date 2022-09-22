<?php

namespace App\Events;

use App\Models\Bid;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BidPlaced
{
    use Dispatchable, SerializesModels;

    public function __construct(public Bid $bid)
    {

    }
}
