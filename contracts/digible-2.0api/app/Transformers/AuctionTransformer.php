<?php

namespace App\Transformers;

use App\DTO\Money;
use App\Models\Auction;
use League\Fractal\Resource\ResourceInterface;
use League\Fractal\TransformerAbstract;
use Spatie\Fractal\Facades\Fractal;
use Spatie\Fractalistic\ArraySerializer;

class AuctionTransformer extends TransformerAbstract
{
    protected $defaultIncludes = [
        'currency',
    ];

    protected $availableIncludes = [
        'user',
        'collectionItem',
        'currency',
    ];

    public function transform(Auction $auction): array
    {
        return [
            'id' => $auction->uuid,
            'status' => $auction->auction_status_id->getPresentableName(),
            'starts' => $auction->getStartDateTimeFormatted(),
            'ends' => $auction->getEndDateTimeFormatted(),
            'topBid' => $auction->getTopBidValue()->getFormatted()
        ];
    }

    public function includeUser(Auction $auction): ResourceInterface
    {
        return $this->item($auction->user, new UserTransformer());
    }

    public function includeCollectionItem(Auction $auction): ResourceInterface
    {
        return $this->item($auction->collectionItem, new CollectionItemTransformer());
    }

    public function includeCurrency(Auction $auction): ResourceInterface
    {
        if ($auction->currency === null) {
            $auction->load('currency');
        }
        return $this->item($auction->currency, new CurrencyTransformer());
    }
}
