<?php

namespace Database\Factories;

use App\DTO\Money;
use App\Enums\AuctionStatusEnum;
use App\Models\CollectionItem;
use App\Models\Currency;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Auction>
 */
class AuctionFactory extends Factory
{
    /** @var Collection|Currency[] */
    private static Collection $currencies;

    public static function getRandomCurrencyId(): int
    {
        if (empty(self::$currencies)) {
            self::$currencies = Currency::all();
        }
        return self::$currencies[rand(0, count(self::$currencies) - 1)]->id;
    }

    public static function getRandomCurrency(): Currency
    {
        $randomId = self::getRandomCurrencyId();
        return self::$currencies->find($randomId)->first();
    }

    public function definition()
    {
        $startDate = $this->faker->dateTimeBetween('+1 week', '+2 week');
        $reserve_price = $this->faker->numberBetween();
        $starting_price = $this->faker->numberBetween(int2: $reserve_price);
        $currency = self::getRandomCurrency();
        $user = User::factory()->create();
        SellerProfile::factory()->for($user)->create();
        $collection = \App\Models\Collection::factory()->for($user)->create();
        return [
            'user_id' => $user->id,
            'collection_item_id' => CollectionItem::factory()->for($collection),
            'auction_status_id' => AuctionStatusEnum::PENDING->value,
            'starts' => $startDate,
            'period_minutes' => 60,
            'reserve_price' => Money::make((string)$reserve_price, $currency),
            'starting_price' => Money::make((string)$starting_price, $currency),
            'currency_id' => $currency->id
        ];
    }

    public function sold()
    {
        return $this->state(function (array $attributes) {
            return [
                'auction_status_id' => AuctionStatusEnum::ENDED->value,
                'sold' => true,
            ];
        });
    }
}
