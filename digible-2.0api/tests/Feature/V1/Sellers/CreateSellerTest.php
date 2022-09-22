<?php

namespace Tests\Feature\V1\Sellers;

use App\Enums\SellerTypeEnum;
use App\Models\SellerProfile;
use App\Models\User;

class CreateSellerTest extends AbstractBase
{
    public function testFailsWhenNotAuthenticated()
    {
        $this->postJson(self::BASE_ROUTE)
            ->assertUnauthorized();
    }

    public function testFailsWhenAlreadySeller()
    {
        $user = User::factory()
            ->has(SellerProfile::factory()->count(1))
            ->create();

        $this->actingAs($user)
            ->postJson(self::BASE_ROUTE,
                ['type' => SellerTypeEnum::INDIVIDUAL->value]
            )
            ->assertUnprocessable()
            ->assertJsonPath('errors.type.0', 'A seller account has already been set-up for this user');
    }

    public function testAddsSellerAccountFailsIfUserHasNotVerifiedTheirEmail()
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->postJson(self::BASE_ROUTE,
                ['type' => SellerTypeEnum::INDIVIDUAL->value]
            )
            ->assertForbidden();
    }

    public function testAddsSellerAccount()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(self::BASE_ROUTE,
                ['type' => SellerTypeEnum::INDIVIDUAL->value]
            )
            ->assertCreated();
        $this->assertTrue(User::find($user->id)->socialNetworks()->count() === 0);
    }

    public function testFailsToAddsSellerWithSocialNetworksAccount()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(self::BASE_ROUTE,
                [
                    'type' => SellerTypeEnum::INDIVIDUAL->value,
                    'socialNetworks' => [
                        ['network' => 'twitter']
                    ]
                ]
            )
            ->assertUnprocessable()
            ->assertJsonPath('errors.socialNetworks.0', "The social networks passed are not in the correct format. Expected array with 'network' and 'link' keys");
    }

    public function testAddsSellerWithSocialNetworksAccount()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(self::BASE_ROUTE,
                [
                    'type' => SellerTypeEnum::INDIVIDUAL->value,
                    'socialNetworks' => [
                        ['network' => 'twitter', 'link' => '/something'],
                        ['network' => 'instagram', 'link' => '/something'],
                    ]
                ]
            )
            ->assertCreated();
        $this->assertTrue(User::find($user->id)->socialNetworks()->count() === 2);
    }
}
