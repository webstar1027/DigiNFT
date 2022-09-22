<?php

namespace Database\Factories;

use App\Enums\SellerStatusEnum;
use App\Enums\SellerTypeEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SellerProfile>
 */
class SellerProfileFactory extends Factory
{
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'type' => SellerTypeEnum::INDIVIDUAL,
            'status' => SellerStatusEnum::PENDING
        ];
    }

    public function statusApproved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => SellerStatusEnum::APPROVED,
            ];
        });
    }

    public function statusRejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => SellerStatusEnum::REJECTED,
            ];
        });
    }
}
