<?php

namespace App\Services;

use App\Enums\SellerStatusEnum;
use App\Models\SellerProfile;
use App\Models\User;
use App\Repositories\SellerRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SellerService
{
    public function __construct(private SellerRepository $sellerRepository)
    {
    }

    public function createSellerAccount(array $details, User $user): SellerProfile
    {
        return $this->sellerRepository->create($details, $user);
    }

    public function getApprovedSellers(int $perPage): LengthAwarePaginator
    {
        return $this->sellerRepository->getApprovedSellers($perPage);
    }

    public function setStatus(SellerStatusEnum $status, SellerProfile $sellerProfile): void
    {
        $sellerProfile->status = $status;
        if ($sellerProfile->isDirty()) {
            $sellerProfile->save();
        }
    }
}
