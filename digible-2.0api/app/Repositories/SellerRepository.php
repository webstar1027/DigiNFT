<?php

namespace App\Repositories;

use App\Enums\SellerStatusEnum;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SellerRepository
{
    public function create(array $details, User $user): SellerProfile
    {
        if ($user->sellerProfile) {
            // The user is already a seller
            return $user->sellerProfile;
        }

        /** @var SellerProfile $sellerProfile */
        $sellerProfile = $user->sellerProfile()->create([
            'type' => $details['type'],
            'status' => SellerStatusEnum::PENDING
        ]);
        return $sellerProfile;
    }

    public function getApprovedSellers(int $perPage): LengthAwarePaginator
    {
        return SellerProfile::with(['user.socialNetworks'])
            ->where('status', SellerStatusEnum::APPROVED->value)
            ->paginate($perPage)
            ->withQueryString();
    }
}
