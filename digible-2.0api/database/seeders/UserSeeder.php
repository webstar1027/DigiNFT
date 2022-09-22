<?php

namespace Database\Seeders;

use App\Enums\SellerStatusEnum;
use App\Enums\SellerTypeEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        if (!$user) {
            User::create([
                'name' => 'System Labs Admin',
                'email' => 'admin@systemlabs.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'admin' => true
            ])->sellerProfile()->create([
                'type' => SellerTypeEnum::INDIVIDUAL->value,
                'status' => SellerStatusEnum::APPROVED->value
            ]);
            User::create([
                'name' => 'System Labs User',
                'email' => 'user@systemlabs.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now()
            ]);
            User::create([
                'name' => 'System Labs Seller',
                'email' => 'seller@systemlabs.io',
                'password' => Hash::make('password'),
                'email_verified_at' => now()
            ])->sellerProfile()->create([
                'type' => SellerTypeEnum::INDIVIDUAL->value,
                'status' => SellerStatusEnum::APPROVED->value
            ]);
        }
    }
}
