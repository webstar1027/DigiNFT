<?php

namespace App\Http\Requests\Sellers;

use App\Enums\SellerTypeEnum;
use App\Enums\SocialNetworkEnum;
use App\Models\User;
use App\Rules\SocialNetwork;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Contracts\Validation\Validator as ValidatorInterface;

class CreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(SellerTypeEnum::class)],
            'socialNetworks' => ['bail', 'nullable', 'array', new SocialNetwork()],
        ];
    }

    public function withValidator(ValidatorInterface $validator): void
    {
        $validator->after(function(ValidatorInterface $validator) {
            /** @var User $user */
            $user = $this->user();
            if ($user->isSeller()) {
                $validator->errors()->add('type', trans('seller.already_created'));
            }
        });
    }
}
