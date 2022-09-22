<?php

namespace Database\Seeders;

use App\Enums\AuctionStatusEnum;
use App\Models\AuctionStatus;
use Illuminate\Database\Seeder;

class AuctionStatusSeeder extends Seeder
{
    public function run()
    {
        $dbStatus = AuctionStatus::first();
        if ($dbStatus !== null) {
            return;
        }
        $statuses = [
            [
                'id' => AuctionStatusEnum::PENDING->value,
                'name' => 'pending'
            ],
            [
                'id' => AuctionStatusEnum::ACTIVE->value,
                'name' => 'active'
            ],
            [
                'id' => AuctionStatusEnum::ENDED->value,
                'name' => 'ended'
            ],
        ];
        foreach ($statuses as $status) {
            AuctionStatus::forceCreate($status);
        }
    }
}
