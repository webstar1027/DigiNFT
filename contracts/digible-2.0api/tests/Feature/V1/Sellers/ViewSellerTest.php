<?php

namespace Tests\Feature\V1\Sellers;

use App\Models\SellerProfile;
use App\Models\User;

class ViewSellerTest extends AbstractBase
{
    public function testAnyUserCanViewApprovedSellerAccount()
    {
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->statusApproved()->create();
        $this->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid]);
    }

    public function testUnauthenticatedUserCanNotViewUnApprovedSellerAccounts()
    {
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->create();
        $this->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertForbidden();
        $sellerProfile = SellerProfile::factory()->statusRejected()->create();
        $this->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertForbidden();
    }

    public function testUserCanViewOwnUnApprovedSellerAccount()
    {
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->create();
        $testUser = $sellerProfile->user;
        $this->actingAs($testUser)
            ->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid]);
        $sellerProfile = SellerProfile::factory()->statusRejected()->create();
        // This user should not be able to see another users unapproved details
        $this->actingAs($testUser)
            ->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertForbidden();
    }

    public function testAdminUserCanSeeUnapprovedAccounts()
    {
        $user = User::factory()->isAdmin()->create();
        $sellerProfile = SellerProfile::factory()->create();
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid]);
        $sellerProfile = SellerProfile::factory()->statusRejected()->create();
        // This user should not be able to see another users unapproved details
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid]);
    }

    public function testSocialNetworksAreDisplayed()
    {
        /** @var SellerProfile $sellerProfile */
        $sellerProfile = SellerProfile::factory()->statusApproved()->create();
        $sellerProfile->user->socialNetworks()->createMany([
            ['network' => 'twitter', 'link' => '/something'],
            ['network' => 'instagram', 'link' => '/something'],
        ]);
        $this->getJson(self::BASE_ROUTE . '/' . $sellerProfile->user->uuid)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid])
            ->assertJsonFragment(['network' => 'instagram']);
    }
}
