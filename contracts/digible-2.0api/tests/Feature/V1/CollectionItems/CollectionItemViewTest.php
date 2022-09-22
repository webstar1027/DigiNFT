<?php

namespace Tests\Feature\V1\CollectionItems;

use App\Enums\CollectionItemStatus;
use App\Models\Collection;
use App\Models\CollectionItem;
use App\Models\SellerProfile;
use App\Models\User;

class CollectionItemViewTest extends AbstractBase
{
    private function getBaseUrl(string $collectionUuid, ?string $itemUuid = null): string
    {
        $url = sprintf(self::BASE_ROUTE, $collectionUuid);
        return $itemUuid === null ?
            $url :
            ($url . '/' . $itemUuid);
    }

    public function testCanNotViewUnknownCollectionItems()
    {
        $this->getJson($this->getBaseUrl('rubbish'))
            ->assertNotFound();
    }

    public function testApprovedStatuesCanBewViewed()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->has(CollectionItem::factory()->count(50), 'items')
            ->create();
        SellerProfile::factory()->for($collection->user)->create();
        $validItems = $collection->items()
            ->whereIn('status', CollectionItemStatus::publicViewableStatus(true))
            ->get();
        $this->getJson($this->getBaseUrl($collection->uuid) . '?perPage=50')
            ->assertOk()
            ->assertJsonCount($validItems->count(), 'data')
            ->assertJsonFragment(['name' => $validItems->first()->name]);
    }

    public function testPaginatedResults()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->has(CollectionItem::factory()->approved()->count(50), 'items')
            ->create();
        SellerProfile::factory()->for($collection->user)->create();
        $validItems = $collection->items()
            ->whereIn('status', CollectionItemStatus::publicViewableStatus(true))
            ->get();
        $this->getJson($this->getBaseUrl($collection->uuid) . '?perPage=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.pagination.total', $validItems->count())
            ->assertJsonFragment(['name' => $validItems->first()->name]);
    }

    public function testUnApprovedStatuesCanNotBeViewed()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->has(CollectionItem::factory()->pending()->count(20), 'items')
            ->create();
        $this->getJson($this->getBaseUrl($collection->uuid))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function testItemsInPrivateCollectionsCanNotBewViewed()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->private()
            ->has(CollectionItem::factory()->count(20), 'items')
            ->create();
        $this->getJson($this->getBaseUrl($collection->uuid))
            ->assertNotFound();
    }

    public function testUnknownCollectionItemCanNotBeViewed()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->has(CollectionItem::factory()->count(20), 'items')
            ->create();
        $this->getJson($this->getBaseUrl($collection->uuid, 'garbage'))
            ->assertNotFound();
    }

    public function testPrivateCollectionItemCanNotBeViewed()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->private()
            ->has(CollectionItem::factory()->count(20), 'items')
            ->create();
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson($this->getBaseUrl($collection->uuid, $collection->items->first()->uuid))
            ->assertNotFound();
    }

    public function testPrivateCollectionItemCanBeViewedByOwner()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->private()
            ->has(CollectionItem::factory()->approved()->count(20), 'items')
            ->create();
        SellerProfile::factory()->for($collection->user)->create();
        /** @var CollectionItem $item */
        $item = $collection->items->first();
        $this->actingAs($collection->user)
            ->getJson($this->getBaseUrl($collection->uuid, $item->uuid))
            ->assertOk()
            ->assertJsonPath('data.id', $item->uuid)
            ->assertJsonPath('data.name', $item->name)
            ->assertJsonPath('data.status', $item->status->getName());
    }

    public function testPendingCollectionItemCanNotBeViewed()
    {
        /** @var Collection $collection */
        $collection = Collection::factory()
            ->has(CollectionItem::factory()->pending()->count(20), 'items')
            ->create();
        /** @var CollectionItem $item */
        $item = $collection->items->first();
        $this->getJson($this->getBaseUrl($collection->uuid, $item->uuid))
            ->assertNotFound();
    }
}
