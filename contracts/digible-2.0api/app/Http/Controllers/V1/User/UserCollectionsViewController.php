<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Responders\TransformResponderInterface;
use App\Services\CollectionService;
use App\Transformers\UserCollectionTransformer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserCollectionsViewController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private CollectionService $collectionService)
    {
        parent::__construct($responder, UserCollectionTransformer::class);
    }

    public function list(Request $request): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(
                $request->user() ?
                    $this->collectionService->getCollectionsForUser(
                        $this->getPerPage($request),
                        $request->user(),
                        false
                    ) :
                    []
            )
        );
    }
}
