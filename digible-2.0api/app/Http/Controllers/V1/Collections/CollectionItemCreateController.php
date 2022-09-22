<?php

namespace App\Http\Controllers\V1\Collections;

use App\Exceptions\CollectionItemSaveFailedException;
use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Requests\CollectionItems\CreateRequest;
use App\Http\Responders\TransformResponderInterface;
use App\Models\Collection as DigiCollection;
use App\Services\CategoryService;
use App\Services\CollectionItemService;
use App\Transformers\CollectionItemTransformer;
use Symfony\Component\HttpFoundation\Response;

class CollectionItemCreateController extends AbstractApiTransformerController
{
    public function __construct(
        TransformResponderInterface   $responder,
        private CollectionItemService $itemService,
        private CategoryService       $categoryService
    )
    {
        parent::__construct($responder, CollectionItemTransformer::class);
    }

    public function create(CreateRequest $request, DigiCollection $collection): Response
    {
        try {
            $data = $request->validated();
            $categoryId = $this->categoryService->getCategoryFromSlug($data['category']);
            if (!$categoryId) {
                throw new CollectionItemSaveFailedException;
            }
            $image = $data['image'] ?? null;
            $data['category_id'] = $categoryId->id;
            unset($data['image'], $data['category']);
            $item = $this->itemService->create(
                $collection,
                $data,
                $image,
            );
            return $this->responder->respondCreated(
                $this->responder->getTransformedItem($item)
            );
        } catch (CollectionItemSaveFailedException $ex) {
            return $this->responder
                ->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR)
                ->respondException($ex);
        }
    }
}
