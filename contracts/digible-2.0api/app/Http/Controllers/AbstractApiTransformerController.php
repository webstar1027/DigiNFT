<?php

namespace App\Http\Controllers;

use App\Http\Responders\TransformResponderInterface;

abstract class AbstractApiTransformerController extends Controller
{
    public function __construct(protected TransformResponderInterface $responder, protected string $transformerClass)
    {
        $this->responder->setTransformerClass($this->transformerClass);
    }
}
