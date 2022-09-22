<?php

namespace App\Services;

use App\DTO\ImageConfig;
use App\Enums\StorageDisk;
use App\Exceptions\FileSaveFailedException;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class ImageService
{
    /**
     * @return string the path of the saved image
     * @throws FileSaveFailedException
     */
    public function saveBase64ImageToDisk(string $base64String, ImageConfig $imageConfig): string
    {
        $image = self::makeImageFromBase64String($base64String)
            ->encode($imageConfig->getEncoding()->value, $imageConfig->getQuality());
        if ($imageConfig->resizeImage()) {
            $image->resize($imageConfig->getWidth(), $imageConfig->getHeight(), function($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }
        if (!Storage::disk(StorageDisk::PUBLIC->value)->put($imageConfig->getFullPath(), $image->stream())) {
            throw new FileSaveFailedException;
        }
        return $imageConfig->getFullPath();
    }

    public static function makeImageFromBase64String(string $base64String): \Intervention\Image\Image
    {
        return Image::make(preg_replace('/^data:image(\/[a-z]+\/)?([a-z]+);base64,/', "", $base64String));
    }
}
