<?php

namespace App\Http\Requests\User;

use App\Models\Collection;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property Collection $collection
 */
class UserCollectionItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)$this->user()?->can('userView', $this->collection);
    }

    public function rules(): array
    {
        return [];
    }
}
