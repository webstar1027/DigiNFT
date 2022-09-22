<?php

namespace App\Http\Controllers\V1\Items;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Responders\TransformResponderInterface;
use App\Services\CollectionItemService;
use App\Transformers\CollectionItemTransformer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllItemsController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private CollectionItemService $collectionItemService)
    {
        parent::__construct($responder, CollectionItemTransformer::class);
    }

    public function listAll(Request $request): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(
                $this->collectionItemService->getAllItems($this->getPerPage($request)),
                ['auction']
            )
        );
    }
}
