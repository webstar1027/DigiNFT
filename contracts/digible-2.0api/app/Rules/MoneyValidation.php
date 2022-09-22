<?php

namespace App\Rules;

use App\DTO\Money;
use App\Models\Currency;
use App\Services\CurrencyService;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\Rule;

class MoneyValidation implements Rule, DataAwareRule
{
    private array $data;

    private bool $hasCurrency = true;

    public function __construct(private CurrencyService $currencyService, private ?Currency $currency =null)
    {
    }

    public function passes($attribute, $value): bool
    {
        $this->hasCurrency = true;
        if (!$this->isCurrencyValid() || $this->currency === null) {
            $this->hasCurrency = false;
            return false;
        }
        try {
            $money = new Money($value, $this->currency);
            return true;
        } catch (\InvalidArgumentException) {
            return false;
        }
    }

    private function isCurrencyValid(): bool
    {
        if ($this->currency !== null) {
            return true;
        }
        if (empty($this->data['currency_id'])) {
            return false;
        }
        $currency = $this->currencyService->getCurrencyFromId((int)$this->data['currency_id']);
        if (empty($currency)) {
            return false;
        }
        $this->currency = $currency;

        return true;
    }

    public function message(): string
    {
        if (!$this->hasCurrency) {
            return trans('validation.money_no_currency');
        }

        return trans('validation.money_value_not_valid');
    }

    /**
     * @param array $data
     */
    public function setData($data): static
    {
        $this->data = $data;

        return $this;
    }
}
