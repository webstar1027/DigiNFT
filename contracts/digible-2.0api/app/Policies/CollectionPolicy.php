<?php

namespace App\Policies;

use App\Models\Collection;
use App\Models\User;

class CollectionPolicy extends BasePolicy
{
    public function createItem(User $user, Collection$collection): bool
    {
        return $user->id === $collection->user->id;
    }

    public function userView(User $user, Collection $collection): bool
    {
        // Restrict the viewing to only the collection owner
        return $user->id === $collection->user_id;
    }

    public function view(?User $user, Collection $collection): bool
    {
        if (!$collection->private) {
            // Anyone cna view a public collection
            return true;
        }
        // Only the collection owner can view the collection if it is a private collection
        return $user !== null && $collection->user->id === $user->id;
    }
}
