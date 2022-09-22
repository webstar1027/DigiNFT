<?php

namespace App\Transformers;

use App\Models\User;
use League\Fractal\TransformerAbstract;

class UserDetailsTransformer extends TransformerAbstract
{
    public function transform(User $user): array
    {
        $data = [
            'id' => $user->uuid,
            'name' => $user->name,
            'email' => $user->email,
            'verified' => $user->hasVerifiedEmail(),
        ];

        if ($user->isAdmin()) {
            $data['admin'] = true;
        }
        $data['seller'] = $user->isSeller();
        if ($user->isSeller()) {
            $data['seller'] = true;
            $data['sellerActive'] = $user->isSellerActive();
        }

        return $data;
    }
}
