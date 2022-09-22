<?php

namespace App\DTO;

use App\Models\Currency;
use InvalidArgumentException;

class Money
{
    private int $base;
    private string $fraction;// This is a string as it can be 0, and we may need X of them

    public function __construct(string $value, private Currency $currency)
    {
        $values = self::validateNumericString($value, $this->currency);
        $this->base = (int)$values[0];
        $this->fraction = str_pad((string)($values[1] ?? '0'), $this->currency->decimal_places, '0', STR_PAD_RIGHT);
    }

    public function getFormatted(bool $hideFractionIfNotSet = false): string
    {
        return $hideFractionIfNotSet && empty((int)$this->fraction) ?
            (string)$this->base :
            ($this->base . '.' . $this->fraction);
    }

    public function getAstInteger(): int
    {
        return (int)($this->base . $this->fraction);
    }

    public function getCurrency(): Currency
    {
        return $this->currency;
    }

    public static function makeFromGenerated(string $value, Currency $currency): Money
    {
        $offset = strlen($value) - $currency->decimal_places;
        return self::make(
            substr_replace($value, '.', $offset, 0),
            $currency
        );
    }

    public static function make(string $value, Currency $currency): Money
    {
        return new Money($value, $currency);
    }

    private static function validateNumericString(string $value, Currency $currency): array
    {
        if (!is_numeric($value)) {
            throw new InvalidArgumentException;
        }
        $values = explode('.', $value);
        if (count($values) > 2) {
            // if there are more than 2 items in the array then this is not a valid number.
            throw new InvalidArgumentException;
        } elseif (count($values) === 1) {
            $values[] = '0';
        }

        if (strlen($values[1]) > $currency->decimal_places) {
            throw new InvalidArgumentException;
        }

        foreach ($values as $numberTest) {
            // Test to make sure the numbers are valid digits
            if (!ctype_digit($numberTest)) {
                throw new InvalidArgumentException;
            }
        }

        return $values;
    }
}
