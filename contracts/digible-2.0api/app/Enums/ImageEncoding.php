<?php

namespace App\Enums;

enum ImageEncoding: string
{
    case JPG = 'jpg';
    case PNG = 'png';
    case GIF = 'gif';
    case WEBP = 'webp';

    public function extension(): string
    {
        // Just future proofing in case we add an encoder that has an oddball extension
        return $this->value;
    }
}
