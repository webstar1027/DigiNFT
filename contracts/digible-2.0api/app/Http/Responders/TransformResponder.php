<?php

namespace App\Http\Responders;

use App\Transformers\ExceptionTransformer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use League\Fractal\Pagination\IlluminatePaginatorAdapter;
use Spatie\Fractal\Fractal;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TransformResponder extends JsonResponder implements TransformResponderInterface
{
    protected string $transformerClass;

    protected bool $pagination = false;

    public function __construct(protected Fractal $fractal)
    {
    }

    public function setTransformerClass(string $transformerClass): self
    {
        $this->transformerClass = $transformerClass;

        return $this;
    }

    public function getTransformedItem(mixed $transformFrom, array $includes = [], array $excludes = []): array
    {
        return $this->getTransformedArray(
            $this->fractal->item($transformFrom),
            $this->transformerClass,
            $includes,
            $excludes
        );
    }

    public function getTransformedCollection(mixed $transformFrom, array $includes = [], array $excludes = []): array
    {
        $fractal = $this->fractal->collection($transformFrom);
        if ($transformFrom instanceof LengthAwarePaginator) {
            // Let's add the pagination meta data to the returned data
            $fractal->paginateWith(new IlluminatePaginatorAdapter($transformFrom));
            $this->pagination = true;
        }
        return $this->getTransformedArray(
            $fractal,
            $this->transformerClass,
            $includes,
            $excludes
        );
    }

    protected function getTransformedArray(
        Fractal $fractal,
        string  $transformationClass,
        array   $includes = [],
        array   $excludes = []
    ): array
    {
        $result = $fractal->transformWith($transformationClass);
        if (!empty($includes)) {
            $result->parseIncludes($includes);
        }
        if (!empty($excludes)) {
            $result->parseExcludes($excludes);
        }
        return $result->toArray();
    }

    public function respondException(Throwable $ex): Response
    {
        return $this->respond(
            $this->getTransformedArray(
                $this->fractal->item($ex),
                ExceptionTransformer::class
            )
        );
    }
}
