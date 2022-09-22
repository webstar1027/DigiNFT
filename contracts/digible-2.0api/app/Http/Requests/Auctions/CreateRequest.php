<?php

namespace App\Http\Requests\Auctions;

use App\Models\Auction;
use App\Rules\CollectionItemValidForAuction;
use App\Rules\MoneyValidation;
use App\Services\CurrencyService;
use Illuminate\Foundation\Http\FormRequest;

class CreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)$this->user()?->can('create', Auction::class);
    }

    public function rules(): array
    {
        $currencyService = app(CurrencyService::class);
        $moneyValidation = new MoneyValidation($currencyService);
        return [
            'collection_item_id' => ['required', new CollectionItemValidForAuction($this->user(), $this)],
            'starts' => ['required', 'date_format:' . \DateTimeInterface::ATOM, 'after:now'],
            'period_minutes' => ['required', 'numeric', 'integer', 'gt:0'],
            'reserve_price' => ['required', 'numeric', 'gte:0', 'gte:starting_price', $moneyValidation],
            'starting_price' => ['required', 'numeric', 'gte:0', 'lte:reserve_price', $moneyValidation],
            'currency_id' => ['required', 'exists:currencies,id']
        ];
    }
}
