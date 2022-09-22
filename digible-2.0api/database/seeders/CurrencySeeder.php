<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $currency = Currency::first();
        if ($currency !== null) {
            return;
        }
        $currencies = [
            [
                'name' => 'US Dollar',
                'code' => 'USD',
                'decimal_places' => 2,
                'symbol' => '$',
                'active' => true,
                'crypto' => false,
            ],
            [
                'name' => 'Digible',
                'code' => 'DIGI',
                'decimal_places' => 8,
                'symbol' => 'DIGI',
                'active' => true,
                'crypto' => true,
            ],
        ];
        foreach ($currencies as $create) {
            Currency::create($create);
        }
    }
}
