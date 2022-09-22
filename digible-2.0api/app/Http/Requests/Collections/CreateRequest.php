<?php

namespace App\Http\Requests\Collections;

use App\Models\Collection;
use App\Rules\Base64Image;
use App\Rules\SocialNetwork;
use Illuminate\Foundation\Http\FormRequest;

class CreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Any logged-in user should be able to create a collection
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'logo_image' => ['required', 'string', new Base64Image],
            'banner_image' => ['required', 'string', new Base64Image],
            'description' => ['nullable', 'string'],
            'private' => ['required', 'boolean'],
            'socialNetworks' => ['bail', 'nullable', 'array', new SocialNetwork]
        ];
    }
}
