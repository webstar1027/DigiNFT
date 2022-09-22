<?php

namespace App\Transformers;

use App\Models\User;
use League\Fractal\Resource\ResourceInterface;
use League\Fractal\TransformerAbstract;

class UserTransformer extends TransformerAbstract
{
    protected $availableIncludes = [
        'socialNetworks'
    ];

    public function transform(User $user): array
    {
        return [
            'id' => $user->uuid,
            'name' => $user->name
        ];
    }

    public function includeSocialNetworks(User $user): ResourceInterface
    {
        return $this->collection($user->socialNetworks, new UserSocialNetworkTransformer);
    }
}
