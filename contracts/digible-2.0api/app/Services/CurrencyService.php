<?php

namespace App\Services;

use App\Models\Currency;
use App\Repositories\CurrencyRepository;

class CurrencyService
{
    public function __construct(private CurrencyRepository $currencyRepository)
    {
    }

    public function getCurrencyFromId(int $currencyId): ?Currency
    {
        return $this->currencyRepository->getCurrencyFromId($currencyId);
    }

    public function getCurrencyFromCode(string $code): ?Currency
    {
        return $this->currencyRepository->getCurrencyFromCode($code);
    }
}
