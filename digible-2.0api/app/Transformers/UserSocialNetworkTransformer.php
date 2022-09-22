<?php

namespace App\Transformers;

use App\Models\UserSocialNetwork;
use League\Fractal\TransformerAbstract;

class UserSocialNetworkTransformer extends TransformerAbstract
{
    public function transform(UserSocialNetwork $socialNetwork): array
    {
        return [
            'network' => $socialNetwork->network->value,
            'link' => $socialNetwork->link
        ];
    }
}
