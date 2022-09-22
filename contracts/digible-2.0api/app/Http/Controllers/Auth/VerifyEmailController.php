<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Auth\VerifyEmailRequest;
use Illuminate\Auth\Events\Verified;
use Symfony\Component\HttpFoundation\Response;

class VerifyEmailController extends ApiController
{
    public function __invoke(VerifyEmailRequest $request): Response
    {
        if ($request->user()?->hasVerifiedEmail()) {
            return $this->responder->respondNoContent();
        }

        if ($request->user()?->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return $this->responder->respondNoContent();
    }
}
