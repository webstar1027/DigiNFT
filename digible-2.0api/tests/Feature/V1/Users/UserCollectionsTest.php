<?php

namespace Tests\Feature\V1\Users;

use App\Models\Collection;
use App\Models\User;

class UserCollectionsTest extends AbstractBase
{
    public function testUnauthenticatedUserCanNotSeeCollections()
    {
        $this->getJson(self::BASE_ROUTE . '/collections')
            ->assertUnauthorized();
    }

    public function testUserCanSeeTheirOwnCollections()
    {
        $user = User::factory()->create();
        Collection::factory()
            ->for($user)
            ->count(20)
            ->create();
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/collections')
            ->assertOk()
            ->assertJsonCount(20, 'data');
    }

    public function testUserCanSeeTheirOwnCollectionPagination()
    {
        $user = User::factory()->create();
        Collection::factory()
            ->for($user)
            ->count(20)
            ->create();
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/collections?perPage=5')
            ->assertOk()
            ->assertJsonPath('meta.pagination.total', 20)
            ->assertJsonCount(5, 'data');
    }

    public function testUserCanSeeTheCollectionsEndpointEvenWithNoCollections()
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/collections')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
