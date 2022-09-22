<?php

namespace Tests\Feature\V1\Auctions;

use App\Models\Auction;

class ViewAuctionListTest extends AbstractBase
{
    public function testCanViewListOfActiveAuctions()
    {
        $auctions = Auction::factory()->count(20)->create();
        /** @var Auction $auction */
        $auction = $auctions->first();

        $this->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('data.0.id', $auction->uuid)
            ->assertJsonPath('data.0.starts', $auction->getStartDateTimeFormatted())
            ->assertJsonPath('data.0.ends', $auction->getEndDateTimeFormatted())
            ->assertJsonPath('data.0.id', $auction->uuid)
            ->assertJsonPath('data.0.collectionItem.data.id', $auction->collectionItem->uuid);
    }

    public function testCanViewPaginatedListOfActiveAuctions()
    {
        Auction::factory()->count(20)->create();

        $this->getJson(self::BASE_ROUTE . '?perPage=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.pagination.total', 20);
    }

    public function testCanViewSingleAuction()
    {
        $auctions = Auction::factory()->count(20)->create();
        /** @var Auction $auction */
        $auction = $auctions->random();

        $this->getJson(self::BASE_ROUTE . '/' . $auction->uuid)
            ->assertOk()
            ->assertJsonPath('data.id', $auction->uuid)
            ->assertJsonPath('data.starts', $auction->getStartDateTimeFormatted())
            ->assertJsonPath('data.ends', $auction->getEndDateTimeFormatted())
            ->assertJsonPath('data.collectionItem.data.id', $auction->collectionItem->uuid);
    }

    public function testEndedAuctionsAreNotListed()
    {
        Auction::factory()
            ->sold()
            ->count(20)
            ->create();
        $this->getJson(self::BASE_ROUTE)
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function testCanNotViewSingleEndedAuction()
    {
        $auctions = Auction::factory()
            ->sold()
            ->count(20)
            ->create();

        $this->getJson(self::BASE_ROUTE . '/' . $auctions->first()->uudi)
            ->assertOk()
            ->assertJson(['data' => []]);
    }

}
