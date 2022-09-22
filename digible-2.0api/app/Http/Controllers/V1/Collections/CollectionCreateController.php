<?php

namespace App\Http\Controllers\V1\Collections;

use App\Exceptions\CollectionSaveFailedException;
use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Requests\Collections\CreateRequest;
use App\Http\Responders\TransformResponderInterface;
use App\Services\CollectionService;
use App\Transformers\CollectionTransformer;
use Symfony\Component\HttpFoundation\Response;

class CollectionCreateController extends AbstractApiTransformerController
{
    public function __construct(TransformResponderInterface $responder, private CollectionService $collectionService)
    {
        parent::__construct($responder, CollectionTransformer::class);
    }

    public function create(CreateRequest $request): Response
    {
        try {
            if (!$request->user()) {
                throw new CollectionSaveFailedException();
            }
            $collection = $this->collectionService->create($request->user(), $request->validated(),);
            return $this->responder->respondCreated(
                $this->responder->getTransformedItem($collection)
            );
        } catch (CollectionSaveFailedException $ex) {
            return $this->responder
                ->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR)
                ->respondException($ex);
        }
    }
}
