<?php

namespace App\Policies;

use App\Enums\CollectionItemStatus;
use App\Models\CollectionItem;
use App\Models\User;

class CollectionItemPolicy extends BasePolicy
{

    public function view(?User $user, CollectionItem $item): bool
    {
        if (in_array($item->status->value, CollectionItemStatus::publicViewableStatus(true))) {
            return true;
        }
        return $user !== null && $user->id === $item->collection->user_id;
    }
}
