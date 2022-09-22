<?php

namespace App\Http\Requests\CollectionItems;

use App\Models\Collection as DigiCollection;
use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property DigiCollection $collection
 */
class CreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)$this->user()?->can('createItem', $this->collection);
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'exists:categories,slug'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', new Base64Image],
        ];
    }
}
