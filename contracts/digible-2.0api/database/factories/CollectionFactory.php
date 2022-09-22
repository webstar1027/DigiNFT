<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Collection>
 */
class CollectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentences(10, true),
            'private' => false
        ];
    }

    public function private()
    {
        return $this->state(function (array $attributes) {
            return [
                'private' => true,
            ];
        });
    }

    public function unverifiedUser()
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => User::factory()->unverified(),
            ];
        });
    }
}
