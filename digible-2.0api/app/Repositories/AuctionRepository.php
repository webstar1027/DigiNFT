<?php

namespace App\Repositories;

use App\Models\Auction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuctionRepository
{
    public function getAll(int $perPage, array $statuses): LengthAwarePaginator
    {
        return Auction::with([
            'collectionItem.category',
            'collectionItem.collection.user.sellerProfile.user.socialNetworks',
            'currency'
        ])
            ->whereIn('auction_status_id', $statuses)
            ->paginate($perPage)
            ->withQueryString();
    }
}
