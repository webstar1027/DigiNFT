<?php

namespace App\Policies;

use App\Models\Auction;
use App\Models\User;

class AuctionPolicy extends BasePolicy
{
    public function create(User $user): bool
    {
        // Only active sellers can create auctions
        return $user->isSellerActive();
    }

    public function placeBid(User $user, Auction $auction): bool
    {
        // A user can not bid on their own auction
        return $user->id !== $auction->user_id;
    }
}
