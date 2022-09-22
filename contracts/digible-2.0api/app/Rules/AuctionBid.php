<?php

namespace App\Rules;

use App\Models\Auction;
use Illuminate\Contracts\Validation\Rule;

class AuctionBid implements Rule
{
    private bool $ended = false;

    public function __construct(private Auction $auction)
    {
    }

    public function passes($attribute, $value): bool
    {
        if ($this->auction->hasEnded()) {
            $this->ended = true;
            return false;
        }
        return $this->auction->hasStarted();
    }

    public function message(): string
    {
        return $this->ended ?
            trans('auction.ended') :
            trans('auction.not_started');
    }
}
