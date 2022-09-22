<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Responders\TransformResponderInterface;
use App\Transformers\UserDetailsTransformer;
use Symfony\Component\HttpFoundation\Response;

class UserDetailsViewController extends AbstractApiTransformerController
{
    public function __construct(TransformResponderInterface $responder)
    {
        parent::__construct($responder, UserDetailsTransformer::class);
    }

    public function currentUser(): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedItem(\Auth::user())
        );
    }
}
