<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Requests\User\UserCollectionItemsRequest;
use App\Http\Responders\TransformResponderInterface;
use App\Models\Collection as DigiCollection;
use App\Services\CollectionItemService;
use App\Transformers\CollectionItemTransformer;
use Symfony\Component\HttpFoundation\Response;

class UserCollectionItemsViewController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private CollectionItemService $collectionItemService)
    {
        parent::__construct($responder, CollectionItemTransformer::class);
    }

    public function list(UserCollectionItemsRequest $request, DigiCollection $collection): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(
                $this->collectionItemService->getItemsForCollection(
                    $this->getPerPage($request),
                    $collection,
                    []
                ),
                ['auction']
            )
        );
    }
}
