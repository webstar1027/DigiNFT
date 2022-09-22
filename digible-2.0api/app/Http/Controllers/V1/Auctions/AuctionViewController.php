<?php

namespace App\Http\Controllers\V1\Auctions;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Responders\TransformResponderInterface;
use App\Models\Auction;
use App\Services\AuctionService;
use App\Transformers\AuctionTransformer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuctionViewController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private AuctionService $auctionService)
    {
        parent::__construct($responder, AuctionTransformer::class);
    }

    public function listAuctions(Request $request): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(
                $this->auctionService->getAll($this->getPerPage($request)),
                ['collectionItem']
            )
        );
    }

    public function getAuction(Auction $auction): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedItem($auction, ['collectionItem'])
        );
    }
}
