<?php

namespace App\Http\Requests\Sellers;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/**
 * @property User $user
 */
class ViewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('view', $this->user->sellerProfile);
    }

    public function rules(): array
    {
        return [];
    }
}
