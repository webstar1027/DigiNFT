<?php

namespace App\Http\Responders;

use Symfony\Component\HttpFoundation\Response;

abstract class AbstractResponder implements ResponderInterface
{
    protected int $statusCode = Response::HTTP_OK;

    public function setStatusCode(int $statusCode): ResponderInterface
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    public function respondCreated(?array $data = null): Response
    {
        return $this->setStatusCode(Response::HTTP_CREATED)
            ->respond($data);
    }

    public function respondNoContent(): Response
    {
        return $this->setStatusCode(Response::HTTP_NO_CONTENT)
            ->respond(null);
    }

    public function responseAccepted(?array $data = null): Response
    {
        return $this->setStatusCode(Response::HTTP_ACCEPTED)
            ->respond($data);
    }

    public function respondNotFound(?array $data = null): Response
    {
        return $this->setStatusCode(Response::HTTP_NOT_FOUND)
            ->respond(null);
    }
}
