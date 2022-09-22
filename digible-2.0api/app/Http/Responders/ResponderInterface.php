<?php

namespace App\Http\Responders;

use Symfony\Component\HttpFoundation\Response;
use Throwable;

interface ResponderInterface
{
    public function setStatusCode(int $statusCode): ResponderInterface;

    public function respondCreated(?array $data = null): Response;

    public function respondNoContent(): Response;

    public function responseAccepted(?array $data = null): Response;

    public function respondNotFound(?array $data = null): Response;

    public function respond(?array $data): Response;

    public function respondException(Throwable $ex): Response;
}
