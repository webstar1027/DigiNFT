<?php

namespace App\Enums;

enum CollectionItemStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case FOR_SALE = 'for_sale';
    case SOLD = 'sold';

    public function getSlug(): string
    {
        // Just future proofing
        return $this->value;
    }

    public function getName(): string
    {
        // Just future proofing
        return ucwords(str_replace('_', ' ', $this->value));
    }

    public static function publicViewableStatus(bool $asValues = false): array
    {
        $statues = [
            CollectionItemStatus::APPROVED,
            CollectionItemStatus::FOR_SALE,
        ];
        if ($asValues) {
            $statues = array_map(function(CollectionItemStatus $status) {
                return $status->value;
            }, $statues);
        }

        return $statues;
    }
}
