<?php

namespace App\Repositories;

use App\Helpers\CacheHelper;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Collection as DbCollection;
use Illuminate\Support\Facades\Cache;

class CurrencyRepository
{
    private static DbCollection $currencies;

    public function getAllCurrencies(): DbCollection
    {
        if (empty(self::$currencies)) {
            self::$currencies = Cache::remember(
                CacheHelper::KEY_CURRENCIES_ALL,
                CacheHelper::TEN_MINUTES * 3,
                function() {
                    return Currency::all();
                }
            );
        }
        return self::$currencies;
    }

    public function getCurrencyFromId(int $id): ?Currency
    {
        /** @var ?Currency $currency */
        $currency = $this->getAllCurrencies()->find($id); // Just making PhpStan happy
        return $currency;
    }

    public function getCurrencyFromCode(string $code): ?Currency
    {
        /** @var ?Currency $currency */
        $currency = $this->getAllCurrencies()->where('code', $code)->first(); // Just making PhpStan happy
        return $currency;
    }
}
