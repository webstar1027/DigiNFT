<?php

namespace App\Http\Controllers\V1\Auctions;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Auctions\BidRequest;
use App\Http\Responders\ResponderInterface;
use App\Models\Auction;
use App\Services\AuctionService;
use Symfony\Component\HttpFoundation\Response;

class PlaceBidController extends ApiController
{
    public function __construct(ResponderInterface $responder, private AuctionService $auctionService)
    {
        parent::__construct($responder);
    }

    public function processBid(BidRequest $request, Auction $auction): Response
    {
        $data = $request->validated();

        if ($request->user()) {
            $this->auctionService->placeBid($auction, $request->user(), (string)$data['price']);
        }

        return $this->responder->responseAccepted();
    }
}
