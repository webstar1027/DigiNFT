<?php

namespace App\Http\Controllers\V1\Auctions;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Requests\Auctions\CreateRequest;
use App\Http\Responders\TransformResponderInterface;
use App\Services\AuctionService;
use App\Transformers\AuctionTransformer;
use Symfony\Component\HttpFoundation\Response;

class AuctionCreateController extends AbstractApiTransformerController
{
    public function __construct(TransformResponderInterface $responder, private AuctionService $auctionService)
    {
        parent::__construct($responder, AuctionTransformer::class);
    }

    public function create(CreateRequest $request): Response
    {
        $data = $request->validated();
        $data['collection_item_id'] = $request->get('collectionItem')->id;
        return $this->responder->respondCreated(
            $request->user() ?
                $this->responder->getTransformedItem($this->auctionService->create($request->user(), $data)) :
                []
        );
    }
}
