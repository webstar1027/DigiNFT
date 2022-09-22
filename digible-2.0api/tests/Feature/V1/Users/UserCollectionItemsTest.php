<?php

namespace Tests\Feature\V1\Users;

use App\Enums\CollectionItemStatus;
use App\Models\Collection;
use App\Models\CollectionItem;
use App\Models\SellerProfile;
use App\Models\User;

class UserCollectionItemsTest extends AbstractBase
{
    private function getBaseUrl(Collection $collection): string
    {
        return sprintf('%s/collections/%s/items', self::BASE_ROUTE, $collection->uuid);
    }

    public function testUnauthenticatedUserCanNotView()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()->create();
        $this->getJson($this->getBaseUrl($collection))
            ->assertUnauthorized();
    }

    public function testUserCanNotSeeOtherUsersItems()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()->create();
        CollectionItem::factory()
            ->for($collection)
            ->count(20)
            ->create();
        $user= User::factory()->create();
        $this->actingAs($user)
            ->getJson($this->getBaseUrl($collection))
            ->assertForbidden();
    }

    public function testUserCanViewAllTheirItems()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()->create();
        // Create 20 pending items as no one other tha the owner should be able to see these
        CollectionItem::factory()
            ->for($collection)
            ->pending()
            ->count(20)
            ->create();
        SellerProfile::factory()->for($collection->user)->create();
        $this->actingAs($collection->user)
            ->getJson($this->getBaseUrl($collection) . '?perPage=10')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.pagination.total', 20);
        // Check the database only have 20 pending collection items
        $this->assertTrue(CollectionItem::where('status', CollectionItemStatus::PENDING->value)->count() === 20);
    }
}
