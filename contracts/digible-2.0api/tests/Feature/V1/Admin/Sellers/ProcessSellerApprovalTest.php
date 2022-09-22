<?php

namespace Tests\Feature\V1\Admin\Sellers;

use App\Enums\SellerStatusEnum;
use App\Models\SellerProfile;
use App\Models\User;
use Tests\Feature\V1\Admin\AbstractAdmin;

class ProcessSellerApprovalTest extends AbstractAdmin
{
    public function testUnauthenticatedUserCanNotApproveSellerAccount()
    {
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->create();
        $this->postJson(self::ADMIN_ROUTE . 'sellers/process-approval/' . $sellerProfile->user->uuid,
            [
                'status' => SellerStatusEnum::PENDING
            ]
        )->assertUnauthorized();
    }

    public function testUnauthorisedUserCanNotApproveSellerAccount()
    {
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->create();
        $this->actingAs($sellerProfile->user)
            ->postJson(self::ADMIN_ROUTE . 'sellers/process-approval/' . $sellerProfile->user->uuid,
                [
                    'status' => SellerStatusEnum::PENDING
                ]
            )->assertForbidden();
    }

    public function testAdminCanApproveSellerAccount()
    {
        /** @var User $user */
        $user = User::factory()->isAdmin()->create();
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->create();
        $this->actingAs($user)
            ->postJson(self::ADMIN_ROUTE . 'sellers/process-approval/' . $sellerProfile->user->uuid,
                [
                    'status' => SellerStatusEnum::PENDING
                ]
            )->assertNoContent();
        $this->assertTrue(SellerProfile::find($sellerProfile->id)->status === SellerStatusEnum::PENDING);
        $this->actingAs($user)
            ->postJson(self::ADMIN_ROUTE . 'sellers/process-approval/' . $sellerProfile->user->uuid,
                [
                    'status' => SellerStatusEnum::APPROVED
                ]
            )->assertNoContent();
        $this->assertTrue(SellerProfile::find($sellerProfile->id)->status === SellerStatusEnum::APPROVED);
        $this->actingAs($user)
            ->postJson(self::ADMIN_ROUTE . 'sellers/process-approval/' . $sellerProfile->user->uuid,
                [
                    'status' => SellerStatusEnum::REJECTED
                ]
            )->assertNoContent();
        $this->assertTrue(SellerProfile::find($sellerProfile->id)->status === SellerStatusEnum::REJECTED);
    }
}
