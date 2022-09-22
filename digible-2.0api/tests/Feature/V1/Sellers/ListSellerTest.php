<?php

namespace Tests\Feature\V1\Sellers;

use App\Enums\SellerStatusEnum;
use App\Models\SellerProfile;
use App\Models\User;

class ListSellerTest extends AbstractBase
{
    public function testOnlyApprovedSellersAreShownToNonAdmins()
    {
        $activeSellersCount = SellerProfile::where('status', SellerStatusEnum::APPROVED->value)->count();
        $sellerProfiles = SellerProfile::factory()->count(5)->create();
        SellerProfile::factory()->statusRejected()->create();

        $this->getJson(self::BASE_ROUTE)
            ->assertJsonCount($activeSellersCount, 'data');
        $sellerProfile = SellerProfile::factory()->statusApproved()->create();
        // No auth user
        $this->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid])
            ->assertJsonMissing(['status' => SellerStatusEnum::PENDING->value])
            ->assertJsonMissing(['status' => SellerStatusEnum::REJECTED->value]);
        // A seller auth user that should not see even their own seller account in the list
        $this->actingAs($sellerProfiles->first()->user)
            ->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonFragment(['id' => $sellerProfile->user->uuid])
            ->assertJsonMissing(['status' => SellerStatusEnum::PENDING->value])
            ->assertJsonMissing(['status' => SellerStatusEnum::REJECTED->value]);

        $user = User::factory()->isAdmin()->create();
        // Even the admin should only see approved sellers in the list
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonMissing(['status' => SellerStatusEnum::PENDING->value])
            ->assertJsonMissing(['status' => SellerStatusEnum::REJECTED->value]);
    }

    public function testSellersListIsPaginated()
    {
        SellerProfile::factory()->statusApproved()->count(25)->create();
        $this->getJson(self::BASE_ROUTE . '?perPage=5')
            ->assertJsonCount(5, 'data');
    }
}
