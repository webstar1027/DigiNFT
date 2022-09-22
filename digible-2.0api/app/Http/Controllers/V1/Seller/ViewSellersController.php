<?php

namespace App\Http\Controllers\V1\Seller;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Controllers\Traits\PaginationPerPageTrait;
use App\Http\Requests\Sellers\ViewRequest;
use App\Http\Responders\TransformResponderInterface;
use App\Models\User;
use App\Services\SellerService;
use App\Transformers\SellerProfileTransformer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ViewSellersController extends AbstractApiTransformerController
{
    use PaginationPerPageTrait;

    public function __construct(TransformResponderInterface $responder, private SellerService $sellerService)
    {
        parent::__construct($responder, SellerProfileTransformer::class);
    }

    public function listSellers(Request $request): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedCollection(
                $this->sellerService->getApprovedSellers($this->getPerPage($request))
            )
        );
    }

    public function getSeller(ViewRequest $request, User $user): Response
    {
        return $this->responder->respond(
            $this->responder->getTransformedItem($user->sellerProfile)
        );
    }
}
