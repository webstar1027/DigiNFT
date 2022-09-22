<?php

namespace App\Transformers;

use League\Fractal\TransformerAbstract;
use Throwable;

class ExceptionTransformer extends TransformerAbstract
{
    public function transform(Throwable $exception): array
    {
        return [
            'error' => $exception->getMessage()
        ];
    }
}
