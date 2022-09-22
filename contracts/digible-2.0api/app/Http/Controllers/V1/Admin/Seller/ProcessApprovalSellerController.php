<?php

namespace App\Http\Controllers\V1\Admin\Seller;

use App\Enums\SellerStatusEnum;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Sellers\ProcessApprovalRequest;
use App\Http\Responders\ResponderInterface;
use App\Models\User;
use App\Services\SellerService;
use Symfony\Component\HttpFoundation\Response;

class ProcessApprovalSellerController extends ApiController
{
    public function __construct(ResponderInterface $responder, private SellerService $sellerService)
    {
        parent::__construct($responder);
    }

    public function processRequest(ProcessApprovalRequest $request, User $user): Response
    {
        if ($user->sellerProfile) {
            $this->sellerService->setStatus(
                SellerStatusEnum::from($request->only('status')['status']),
                $user->sellerProfile
            );
        }

        return $this->responder->respondNoContent();
    }
}
