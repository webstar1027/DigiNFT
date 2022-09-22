<?php

namespace Tests\Feature\V1\Auctions;

use App\DTO\Money;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class BidPlaceTest extends AbstractBase
{
    private function getBasePath(Auction $auction): string
    {
        return sprintf('%s/%s/bid', self::BASE_ROUTE, $auction->uuid);
    }

    public function testBidFailedWhenNoAuthenticated()
    {
        $auction = Auction::factory()->create();

        $this->postJson($this->getBasePath($auction))
            ->assertUnauthorized();
    }

    public function testBidCanNotBeMadeByAuctionOwner()
    {
        $auction = Auction::factory()->create();

        $this->actingAs($auction->user)
            ->postJson($this->getBasePath($auction))
            ->assertForbidden();
    }

    public function testBidFailsWhenAuctionHasNotStarted()
    {
        $user = User::factory()->create();
        $auction = Auction::factory()->create();

        $this->actingAs($user)
            ->postJson($this->getBasePath($auction), ['price' => 100])
            ->assertUnprocessable()
            ->assertJsonPath('errors.price.0', 'The auction has not started yet.');
    }

    public function testBidFailsWhenAuctionHasEnded()
    {
        $user = User::factory()->create();
        /** @var Auction $auction */
        $auction = Auction::factory()->create();

        $this->travelTo($auction->getEndDateTime()->addSecond());

        $this->actingAs($user)
            ->postJson($this->getBasePath($auction), ['price' => 100])
            ->assertUnprocessable()
            ->assertJsonPath('errors.price.0', 'The auction has ended.');
    }

    public function testBidFailsWhenPriceIsNotValid()
    {
        $user = User::factory()->create();
        /** @var Auction $auction */
        $auction = Auction::factory()->create();

        $this->travelTo($auction->starts);

        $this->actingAs($user)
            ->postJson($this->getBasePath($auction), ['price' => 100.555555555])
            ->assertUnprocessable()
            ->assertJsonPath('errors.price.0', 'The value provided is not a valid value for this given currency.');
    }

    public function testBidCanBeMade()
    {
        $user = User::factory()->create();
        /** @var Auction $auction */
        $auction = Auction::factory()->create();
        if ($auction->currency === null) {
            $auction->load('currency');
        }

        $this->travelTo($auction->starts);

        $this->actingAs($user)
            ->postJson($this->getBasePath($auction), ['price' => 100.59])
            ->assertStatus(Response::HTTP_ACCEPTED);

        /** @var Bid $bid */
        $bid = Bid::first();
        $this->assertTrue($bid->price->getAstInteger() === Money::make(100.59, $auction->currency)->getAstInteger());
    }

    public function testHighestBidIsShownOnAuctionListing()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        /** @var Auction $auction */
        $auction = Auction::factory()->create();
        if ($auction->currency === null) {
            $auction->load('currency');
        }

        $this->travelTo($auction->starts);

        $this->actingAs($user1)
            ->postJson($this->getBasePath($auction), ['price' => 110.59])
            ->assertStatus(Response::HTTP_ACCEPTED);

        $this->actingAs($user2)
            ->postJson($this->getBasePath($auction), ['price' => 100.59])
            ->assertStatus(Response::HTTP_ACCEPTED);

        $this->getJson(self::ROUTE_VERSION . 'auctions/' . $auction->uuid)
            ->assertOk()
            ->assertJsonPath('data.topBid', Money::make(110.59, $auction->currency)->getFormatted());
    }
}
