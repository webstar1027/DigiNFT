<?php

namespace App\Transformers;

use App\Enums\AuctionStatusEnum;
use App\Enums\StorageDisk;
use App\Models\CollectionItem;
use Illuminate\Support\Facades\Storage;
use League\Fractal\Resource\ResourceInterface;
use League\Fractal\TransformerAbstract;
use Spatie\Fractal\Fractal;

class CollectionItemTransformer extends TransformerAbstract
{
    protected $defaultIncludes = [
        'category',
        'collection',
        'seller',
    ];

    protected $availableIncludes = [
        'category',
        'collection',
        'seller',
        'auction',
    ];

    public function transform(CollectionItem $item): array
    {
        return [
            'id' => $item->uuid,
            'status' => $item->status->getName(),
            'name' => $item->name,
            'description' => $item->description,
            'is20Item' => true,
            'image' => $item->image ?
                Storage::disk(StorageDisk::PUBLIC->value)->url($item->image)
                : null
        ];
    }

    public function includeCategory(CollectionItem $item): ResourceInterface
    {
        return $this->item($item->category, new CategoryTransformer);
    }

    public function includeCollection(CollectionItem $item): ResourceInterface
    {
        return $this->item($item->collection, new CollectionTransformer);
    }

    public function includeSeller(CollectionItem $item): ResourceInterface
    {
        return $this->item($item->collection->user->sellerProfile, new SellerProfileTransformer);
    }

    public function includeAuction(CollectionItem $item): ResourceInterface
    {
        $auctions = $item->auctions()->whereIn('auction_status_id', [AuctionStatusEnum::PENDING, AuctionStatusEnum::ACTIVE])->first();
        return Fractal::create($auctions)
            ->transformWith(AuctionTransformer::class)
            ->getResource();
    }
}
