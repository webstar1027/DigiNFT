<?php

namespace App\Transformers;

use App\Models\SellerProfile;
use League\Fractal\Resource\ResourceInterface;
use League\Fractal\TransformerAbstract;

class SellerProfileTransformer extends TransformerAbstract
{
    protected $defaultIncludes = [
        'socialNetworks'
    ];

    protected $availableIncludes = [
        'socialNetworks'
    ];

    public function transform(SellerProfile $sellerProfile): array
    {
        return [
            'id' => $sellerProfile->user->uuid,
            'name' => $sellerProfile->user->name,
            'type' => $sellerProfile->type->value,
            'status' => $sellerProfile->status->value
        ];
    }

    public function includeSocialNetworks(SellerProfile $sellerProfile): ResourceInterface
    {
        return $this->collection($sellerProfile->user->socialNetworks, new UserSocialNetworkTransformer);
    }
}
