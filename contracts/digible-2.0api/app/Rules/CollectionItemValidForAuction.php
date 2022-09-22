<?php

namespace App\Rules;

use App\Enums\AuctionStatusEnum;
use App\Enums\CollectionItemStatus;

class CollectionItemValidForAuction extends CollectionItemBelongsToUser
{
    private bool $itemAlreadyOnAuction = false;
    private bool $itemAlreadySold = false;

    public function passes($attribute, $value)
    {
        if (!parent::passes($attribute, $value)) {
            return false;
        }
        // If the item status is not approved then this can not be used for auction
        if ($this->collectionItem?->status !== CollectionItemStatus::APPROVED) {
            return false;
        }
        // Check to make sure this item is not currently on any active or pending auction
        $this->itemAlreadyOnAuction = $this->collectionItem->auctions()
            ->whereIn('auction_status_id', [AuctionStatusEnum::PENDING->value, AuctionStatusEnum::ACTIVE->value])
            ->count() > 0;
        if ($this->itemAlreadyOnAuction) {
            // This item is already on an auction so we can not set up a new auction
            return false;
        }

        $this->itemAlreadySold = $this->collectionItem->auctions()
                ->where('sold', true)
                ->count() > 0;
        if ($this->itemAlreadySold === true) {
            return false;
        }

        return true;
    }

    public function message()
    {
        if (!$this->itemAlreadyOnAuction && !$this->itemAlreadySold) {
            return parent::message();
        }
        return $this->itemAlreadyOnAuction ?
            trans('validation.item_on_active_auction') :
            trans('validation.item_sold_on_auction');
    }
}
