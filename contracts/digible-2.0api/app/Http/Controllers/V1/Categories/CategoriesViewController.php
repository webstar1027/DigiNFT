<?php

namespace App\Http\Controllers\V1\Categories;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Responders\TransformResponderInterface;
use App\Models\Category;
use App\Transformers\CategoryTransformer;
use Symfony\Component\HttpFoundation\Response;

class CategoriesViewController extends AbstractApiTransformerController
{
    public function __construct(TransformResponderInterface $responder)
    {
        parent::__construct($responder, CategoryTransformer::class);
    }

    public function list(): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(Category::all())
        );
    }
}
