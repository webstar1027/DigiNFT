<?php

namespace App\Transformers;

use App\Models\Currency;
use League\Fractal\TransformerAbstract;

class CurrencyTransformer extends TransformerAbstract
{
    public function transform(Currency $currency): array
    {
        return [
            'name' => $currency->name,
            'code' => $currency->code,
            'decimalPlaces' => $currency->decimal_places,
            'symbol' => $currency->symbol,
            'isActive' => $currency->active,
            'isCrypto' => $currency->crypto,
        ];
    }
}
