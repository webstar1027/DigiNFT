<?php

namespace App\Http\Controllers\V1\Seller;

use App\Http\Controllers\AbstractApiTransformerController;
use App\Http\Requests\Sellers\CreateRequest;
use App\Http\Responders\TransformResponderInterface;
use App\Models\User;
use App\Services\SellerService;
use App\Services\UserService;
use App\Transformers\SellerProfileTransformer;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class SellerRequestController extends AbstractApiTransformerController
{
    public function __construct(
        TransformResponderInterface $responder,
        private SellerService       $sellerService,
        private UserService         $userService,
    )
    {
        parent::__construct($responder, SellerProfileTransformer::class);
    }

    public function createSellerAccount(CreateRequest $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $this->userService->syncSocialNetworks($user, new Collection($request->only('socialNetworks')['socialNetworks'] ?? []));
        $sellerProfile = $this->sellerService->createSellerAccount($request->validated(), $user);
        return $this->responder->respondCreated(
            $this->responder->getTransformedItem($sellerProfile)
        );
    }
}
