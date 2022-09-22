<?php

namespace Tests\Feature\V1\Items;

use App\Models\Collection;
use App\Models\CollectionItem;
use App\Models\SellerProfile;

class ListCollectionItemsTest extends AbstractBase
{
    public function testAllCollectionItemsCanBeViewed()
    {
        $collections = Collection::factory()
            ->count(10)
            ->create();
        foreach ($collections as $collection) {
            SellerProfile::factory()->for($collection->user)->create();
            CollectionItem::factory()
                ->for($collection)
                ->approved()
                ->count(50)
                ->create();
        }
        $this->getJson(self::BASE_ROUTE . '?perPage=25')
            ->assertOk()
            ->assertJsonCount(25, 'data')
            ->assertJsonPath('meta.pagination.total', 500);
    }
}
