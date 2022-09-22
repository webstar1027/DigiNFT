<?php

namespace App\Http\Requests\Sellers;

use App\Enums\SellerStatusEnum;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

/**
 * @property User $user
 */
class ProcessApprovalRequest extends FormRequest
{

    public function authorize(): bool
    {
        return (bool)$this->user()?->can('processApprove', $this->user->sellerProfile);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(SellerStatusEnum::class)]
        ];
    }
}
