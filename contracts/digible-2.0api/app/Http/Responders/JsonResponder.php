<?php

namespace App\Http\Responders;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class JsonResponder extends AbstractResponder
{
    public function respond(?array $data): Response
    {
        return new JsonResponse($data, $this->statusCode);
    }

    public function respondException(Throwable $ex): Response
    {
        return $this->respond([
            'error' => $ex->getMessage()
        ]);
    }
}
