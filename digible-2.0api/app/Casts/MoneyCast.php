<?php

namespace App\Casts;

use App\DTO\Money;
use App\Models\Currency;
use App\Models\CurrencyInterface;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class MoneyCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param CurrencyInterface $model
     * @param string $key
     * @param mixed $value
     * @param array $attributes
     * @return Money
     */
    public function get($model, string $key, $value, array $attributes)
    {
        /** @var Currency $currency */
        $currency = $model->getCurrency(); // This will always be set to a currency, but we need to typehint it to keep PhpStan happy
        return Money::makeFromGenerated((string)$value, $currency);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param CurrencyInterface $model
     * @param string $key
     * @param Money $value
     * @param array $attributes
     * @return int
     */
    public function set($model, string $key, $value, array $attributes)
    {
        if (!$value instanceof Money) {
            throw new \InvalidArgumentException('The given value is not a Money instance.');
        }
        if ($model->getCurrency() && $model->getCurrency()->code !== $value->getCurrency()->code) {
            throw new \InvalidArgumentException('The Money currency code does match model currency code.');
        }
        return $value->getAstInteger();
    }
}
