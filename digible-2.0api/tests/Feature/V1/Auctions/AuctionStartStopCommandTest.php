<?php

namespace Tests\Feature\V1\Auctions;

use App\Enums\AuctionStatusEnum;
use App\Models\Auction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuctionStartStopCommandTest extends TestCase
{
    use RefreshDatabase;

    protected bool$seed = true;

    public function testAnAuctionIsStartedWithTheCommand()
    {
        /** @var Auction $auction */
        $auction = Auction::factory()
            ->create();

        $this->assertTrue(Auction::first()->auction_status_id === AuctionStatusEnum::PENDING);

        $this->travelTo($auction->starts);

        $this->artisan('digi:auctioneer')->assertSuccessful();

        $this->assertTrue(Auction::first()->auction_status_id === AuctionStatusEnum::ACTIVE);

        $this->travelTo($auction->starts->addMinutes($auction->period_minutes));

        $this->artisan('digi:auctioneer')->assertSuccessful();

        $this->assertTrue(Auction::first()->auction_status_id === AuctionStatusEnum::ENDED);
    }
}
