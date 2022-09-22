<?php

namespace App\Enums;

enum AuctionStatusEnum: int
{
    case PENDING = 1;
    case ACTIVE = 2;
    case ENDED = 3;

    public function getPresentableName(): string
    {
        return match ($this->name) {
            self::ACTIVE->name => trans('statuses.auction.active'),
            self::ENDED->name => trans('statuses.auction.ended'),
            default => trans('statuses.auction.pending'),
        };
    }
}
