<?php

namespace App\Repositories;

use App\Models\Collection as DigiCollection;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CollectionRepository
{
    use SocialNetworkRepositoryTrait;

    public function create(User $user, array $data): DigiCollection
    {
        /** @var DigiCollection $collection */
        $collection = $user->collections()->forceCreate($data);

        return $collection;
    }

    public function getAllPublic(int $perPage): LengthAwarePaginator
    {
        return DigiCollection::with('user')
            ->where('private', false)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getCollectionForUser(
        int  $perPage,
        User $user,
        bool $excludePrivate = true
    ): LengthAwarePaginator
    {
        $collections = $user->collections();
        if ($excludePrivate) {
            $collections->where('private', false);
        }
        return $collections->paginate($perPage)->withQueryString();
    }
}
