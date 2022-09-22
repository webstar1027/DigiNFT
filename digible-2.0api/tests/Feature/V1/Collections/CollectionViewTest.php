<?php

namespace Tests\Feature\V1\Collections;

use App\Models\Collection;

class CollectionViewTest extends AbstractBase
{
    public function testListOfCollectionsCanBeViewed()
    {
        $collections = Collection::factory()
            ->count(20)
            ->create();
        Collection::factory()
            ->private()
            ->count(20)
            ->create();
        $this->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('data.0.name', $collections[0]->name);
    }

    public function testPaginatedListOfCollectionsCanBeViewed()
    {
        $collections = Collection::factory()
            ->count(20)
            ->create();
        Collection::factory()
            ->private()
            ->count(20)
            ->create();
        $this->getJson(self::BASE_ROUTE . '?perPage=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.pagination.total', 20)
            ->assertJsonPath('data.0.name', $collections[0]->name);
    }

    public function testOnlyPublicCollectionsCanBePubliclyViewed()
    {
        Collection::factory()
            ->private()
            ->count(20)
            ->create();
        $this->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function testCanViewSinglePublicCollection()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()->create();
        $this->getJson(self::BASE_ROUTE . '/' . $collection->uuid)
            ->assertOk()
            ->assertJsonPath('data.name', $collection->name);
    }

    public function testCanNotViewSinglePrivateCollection()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->private()
            ->create();
        $this->getJson(self::BASE_ROUTE . '/' . $collection->uuid)
            ->assertNotFound();
    }

    public function testUserCanViewOwnPrivateCollection()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->private()
            ->create();
        $this->actingAs($collection->user)
            ->getJson(self::BASE_ROUTE . '/' . $collection->uuid)
            ->assertOk()
            ->assertJsonPath('data.name', $collection->name);
    }
}
