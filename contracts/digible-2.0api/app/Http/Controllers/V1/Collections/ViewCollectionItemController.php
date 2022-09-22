<?php

namespace App\Http\Controllers\V1\Collections;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Responders\TransformResponderInterface;
use App\Models\Collection as DigiCollection;
use App\Models\CollectionItem;
use App\Services\CollectionItemService;
use App\Transformers\CollectionItemTransformer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class ViewCollectionItemController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private CollectionItemService $itemService)
    {
        parent::__construct($responder, CollectionItemTransformer::class);
    }

    public function listItems(Request $request, DigiCollection $collection): Response
    {
        if (Gate::denies('view', $collection)) {
            abort(Response::HTTP_NOT_FOUND);
        }
        return $this->responder->respond(
            $this->responder->getTransformedCollection($this->itemService->getItemsForCollection(
                $this->getPerPage($request),
                $collection),
                ['auction']
            )
        );
    }

    public function getItem(DigiCollection $collection, CollectionItem $item): Response
    {
        if (Gate::denies('view', $collection)) {
            abort(Response::HTTP_NOT_FOUND);
        }
        if (Gate::denies('view', $item)) {
            abort(Response::HTTP_NOT_FOUND);
        }
        return $this->responder->respond(
            $this->responder->getTransformedItem($item, ['auction'])
        );
    }
}
