<?php

namespace App\Policies;

use App\Models\SellerProfile;
use App\Models\User;

class SellerProfilePolicy extends BasePolicy
{
    public function view(?User $user, SellerProfile $sellerProfile): bool
    {
        if ($sellerProfile->isApproved()) {
            // Anyone can view a sellers profile if the profile has been approved
            return true;
        }
        // Only the seller or an admin can view seller accounts that have not been approved
        return $user?->sellerProfile?->id === $sellerProfile->id;
    }

    public function processApprove(User $user, SellerProfile $sellerProfile): bool
    {
        // Only admins can approve / reject
        return $sellerProfile->exists && $user->isAdmin();
    }
}
