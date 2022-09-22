<?php

namespace App\Http\Controllers\V1\Collections;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Responders\TransformResponderInterface;
use App\Models\Collection as DigiCollection;
use App\Services\CollectionService;
use App\Transformers\CollectionTransformer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class ViewCollectionController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private CollectionService $collectionService)
    {
        parent::__construct($responder, CollectionTransformer::class);
    }

    public function listCollections(Request $request): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(
                transformFrom: $this->collectionService->getAllPublic($this->getPerPage($request)),
                includes: ['userDetails']
            )
        );
    }

    public function getCollection(DigiCollection $collection): Response
    {
        if (Gate::denies('view', $collection)) {
            abort(Response::HTTP_NOT_FOUND);
        }
        return $this->responder->respond(
            $this->responder->getTransformedItem(
                transformFrom: $collection,
                includes: ['userDetails']
            )
        );
    }
}
