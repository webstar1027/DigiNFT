<?php

namespace App\Http\Requests\Auctions;

use App\Models\Auction;
use App\Rules\AuctionBid;
use App\Rules\MoneyValidation;
use App\Services\CurrencyService;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property Auction $auction
 */
class BidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)$this->user()?->can('placeBid', $this->auction);
    }

    public function rules(): array
    {
        $currencyService = app(CurrencyService::class);
        return [
            'price' => ['required', 'numeric', new AuctionBid($this->auction), new MoneyValidation($currencyService, $this->auction->currency)]
        ];
    }
}
