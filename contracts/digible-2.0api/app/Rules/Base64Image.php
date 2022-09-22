<?php

namespace App\Rules;

use App\Services\ImageService;
use Illuminate\Contracts\Validation\Rule;

class Base64Image implements Rule
{
    public const MAX_SIZE = 10240; //10Mb

    public function __construct(private int $maxSize = Base64Image::MAX_SIZE)
    {

    }

    /**
     * Determine if the validation rule passes.
     *
     * @param string $attribute
     * @param mixed $value
     * @return bool
     */
    public function passes($attribute, $value): bool
    {
        try {
            if (!is_string($value)) {
                return false;
            }
            $image = ImageService::makeImageFromBase64String($value);
            $size = strlen(base64_decode($value));
            $size_kb = $size / 1024;
            return $size_kb <= $this->maxSize;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function message(): string
    {
        return trans('validation.base64_image', ['max_size' => (self::MAX_SIZE / 1024) . 'MB']);
    }
}
