<?php

namespace App\Models;

interface CurrencyInterface
{
    public function getCurrency(): ?Currency;
}
