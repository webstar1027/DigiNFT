<?php

namespace App\DTO;

use App\Enums\ImageEncoding;

class ImageConfig
{
    private ?int $width = null;
    private ?int $height = null;
    private ImageEncoding $encoding = ImageEncoding::JPG;
    private int $quality = 60;

    public function __construct(private string $path, private string $filename)
    {
    }

    public function getEncoding(): ImageEncoding
    {
        return $this->encoding;
    }

    public function setEncoding(ImageEncoding $encoding): ImageConfig
    {
        $this->encoding = $encoding;
        return $this;
    }

    public function getWidth(): ?int
    {
        return $this->width;
    }

    public function setWidth(int $width): ImageConfig
    {
        $this->width = $width;
        return $this;
    }

    public function getHeight(): ?int
    {
        return $this->height;
    }

    public function setHeight(int $height): ImageConfig
    {
        $this->height = $height;
        return $this;
    }

    public function getQuality(): int
    {
        return $this->quality;
    }

    public function setQuality(int $quality): ImageConfig
    {
        $this->quality = $quality;
        return $this;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getFilename(): string
    {
        return $this->filename;
    }

    public function getExtension(): string
    {
        return $this->encoding->extension();
    }

    public function getFullPath(): string
    {
        return trim($this->getPath(), '/') . '/' . $this->getFilename() . '.' . $this->getExtension();
    }

    public function resizeImage(): bool
    {
        return $this->getWidth() !== null || $this->getHeight() !== null;
    }
}
