<?php

namespace App\Http\Responders;

interface TransformResponderInterface extends ResponderInterface
{
    public function setTransformerClass(string $transformerClass): self;

    public function getTransformedItem(mixed $transformFrom, array $includes = [], array $excludes = []): array;

    public function getTransformedCollection(mixed $transformFrom, array $includes = [], array $excludes = []): array;
}
