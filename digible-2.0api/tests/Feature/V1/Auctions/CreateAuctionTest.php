<?php

namespace Tests\Feature\V1\Auctions;

use App\DTO\Money;
use App\Enums\CollectionItemStatus;
use App\Models\Auction;
use App\Models\Collection as DigiCollection;
use App\Models\CollectionItem;
use App\Models\Currency;
use App\Models\SellerProfile;
use App\Models\User;
use Carbon\Carbon;
use Database\Factories\AuctionFactory;
use Illuminate\Foundation\Testing\WithFaker;

class CreateAuctionTest extends AbstractBase
{
    use WithFaker;

    private function getTestStartTime(
        string $start = '+1 day',
        string $end = '+5 day',
        string $timezone = 'Africa/Nairobi'): string
    {
        return $this->faker->dateTimeBetween($start, $end)
            ->setTimezone(new \DateTimeZone($timezone))
            ->format(\DateTimeInterface::ATOM);
    }

    public function testAnUnauthenticatedUserCanNotCreateAnAuction()
    {
        $this->postJson(self::BASE_ROUTE)
            ->assertUnauthorized();
    }

    public function testNonSellerCanNotCreateAuction()
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->postJson(self::BASE_ROUTE)
            ->assertForbidden();
    }

    public function testFailsIfUserHasNotVerifiedTheirEmail()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->for(User::factory()->unverified())
            ->create();
        $this->actingAs($seller->user)
            ->postJson(self::BASE_ROUTE)
            ->assertForbidden();
    }

    public function testFailsIfUserIsNotAnApprovedSeller()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->create();
        $this->actingAs($seller->user)
            ->postJson(self::BASE_ROUTE)
            ->assertForbidden();
    }

    public function testFailsValidationWhenRequiredDataIsNotSent()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        $this->actingAs(
            $seller->user)
            ->postJson(self::BASE_ROUTE)
            ->assertUnprocessable()
            ->assertJsonPath('errors.collection_item_id.0', 'The collection item id field is required.')
            ->assertJsonPath('errors.starts.0', 'The starts field is required.')
            ->assertJsonPath('errors.period_minutes.0', 'The period minutes field is required.')
            ->assertJsonPath('errors.reserve_price.0', 'The reserve price field is required.')
            ->assertJsonPath('errors.starting_price.0', 'The starting price field is required.')
            ->assertJsonPath('errors.currency_id.0', 'The currency id field is required.');
    }

    public function testFailsValidationWhenDataIsInvalid()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        $testData = [
            'collection_item_id' => 'this will not work',
            'starts' => $this->faker->dateTime('-1 day')->format(\DateTimeInterface::ATOM),
            'period_minutes' => -50,
            'reserve_price' => 'nope',
            'starting_price' => 'nope',
            'currency_id' => 'not here'
        ];
        $this->actingAs($seller->user)
            ->postJson(self::BASE_ROUTE, $testData)
            ->assertUnprocessable()
            ->assertJsonPath('errors.collection_item_id.0', 'The selected collection item id is invalid.')
            ->assertJsonPath('errors.starts.0', 'The starts must be a date after now.')
            ->assertJsonPath('errors.period_minutes.0', 'The period minutes must be greater than 0.')
            ->assertJsonPath('errors.reserve_price.0', 'The reserve price must be a number.')
            ->assertJsonPath('errors.starting_price.0', 'The starting price must be a number.')
            ->assertJsonPath('errors.currency_id.0', 'The selected currency id is invalid.');

        $this->actingAs($seller->user)
            ->postJson(self::BASE_ROUTE, array_merge($testData, ['reserve_price' => -50, 'starting_price' => -50]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.reserve_price.0', 'The reserve price must be greater than or equal to 0.')
            ->assertJsonPath('errors.starting_price.0', 'The starting price must be greater than or equal to 0.');

        $this->actingAs($seller->user)
            ->postJson(self::BASE_ROUTE, array_merge($testData, ['reserve_price' => 20, 'starting_price' => 50]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.reserve_price.0', 'The reserve price must be greater than or equal to 50.')
            ->assertJsonPath('errors.starting_price.0', 'The starting price must be less than or equal to 20.');
    }

    public function testSellerCanNotAuctionItemsThatAreNotTheirs()
    {
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->has(CollectionItem::factory()->count(50), 'items')
            ->create();
        $validItems = $collection->items()
            ->whereIn('status', CollectionItemStatus::publicViewableStatus(true))
            ->get();
        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $validItems->first();
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();

        $this->actingAs($seller->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $this->getTestStartTime(),
                'period_minutes' => 60,
                'reserve_price' => 0,
                'starting_price' => 0,
                'currency_id' => AuctionFactory::getRandomCurrencyId()
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.collection_item_id.0', 'The selected collection item id is invalid.');
    }

    public function testSellerCanNotAuctionItemsThatAreNotApproved()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->for($seller->user)
            ->has(CollectionItem::factory()->pending()->count(10), 'items')
            ->create();
        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $collection->items()->first();

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $this->getTestStartTime(),
                'period_minutes' => 60,
                'reserve_price' => 0,
                'starting_price' => 0,
                'currency_id' => AuctionFactory::getRandomCurrencyId()
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.collection_item_id.0', 'The selected collection item id is invalid.');
    }

    public function testAuctionItemCanNotBeAddedIfOneIsAlreadyActive()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->for($seller->user)
            ->has(CollectionItem::factory()->approved()->count(20), 'items')
            ->create();
        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $collection->items()->first();
        Auction::factory()
            ->for($testCollectionItem)
            ->create();

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $this->getTestStartTime(),
                'period_minutes' => 60,
                'reserve_price' => 0,
                'starting_price' => 0,
                'currency_id' => AuctionFactory::getRandomCurrencyId()
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.collection_item_id.0', 'The selected item is already on an auction.');
    }

    public function testAuctionItemCanNotBeAddedIfSoldOnAnAuction()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->for($seller->user)
            ->has(CollectionItem::factory()->approved()->count(20), 'items')
            ->create();
        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $collection->items()->first();
        Auction::factory()
            ->for($testCollectionItem)
            ->sold()
            ->create();

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $this->getTestStartTime(),
                'period_minutes' => 60,
                'reserve_price' => 0,
                'starting_price' => 0,
                'currency_id' => AuctionFactory::getRandomCurrencyId()
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.collection_item_id.0', 'The selected item has been sold already.');
    }

    public function testValidationFailsForNoCurrency()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->for($seller->user)
            ->has(CollectionItem::factory()->approved()->count(20), 'items')
            ->create();

        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $collection->items()->first();

        $startTime = $this->getTestStartTime();
        $utcTime = Carbon::make($startTime)->setSecond(0)->setTimezone('UTC');
        $periodMinutes = 60;

        /** @var Currency $usd */
        $usd = Currency::where('code', 'USD')->first();

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $startTime,
                'period_minutes' => $periodMinutes,
                'reserve_price' => 10.22,
                'starting_price' => 0,
                'currency_id' => 'none'
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.reserve_price.0', 'No valid currency was supplied.')
            ->assertJsonPath('errors.starting_price.0', 'No valid currency was supplied.');
    }

    public function testValidationFailsForIncorrectPrices()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->for($seller->user)
            ->has(CollectionItem::factory()->approved()->count(20), 'items')
            ->create();

        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $collection->items()->first();

        $startTime = $this->getTestStartTime();
        $utcTime = Carbon::make($startTime)->setSecond(0)->setTimezone('UTC');
        $periodMinutes = 60;

        /** @var Currency $usd */
        $usd = Currency::where('code', 'USD')->first();

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $startTime,
                'period_minutes' => $periodMinutes,
                'reserve_price' => 10.222,
                'starting_price' => 0,
                'currency_id' => $usd->id
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.reserve_price.0', 'The value provided is not a valid value for this given currency.')
            ->assertJsonMissing(['errors.starting_price.0']);

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $startTime,
                'period_minutes' => $periodMinutes,
                'reserve_price' => 20,
                'starting_price' => 11.222,
                'currency_id' => $usd->id
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.starting_price.0', 'The value provided is not a valid value for this given currency.')
            ->assertJsonMissing(['errors.reserve_price.0']);
    }

    public function testSellerCanAddAnAuction()
    {
        /** @var SellerProfile $seller */
        $seller = SellerProfile::factory()
            ->statusApproved()
            ->create();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->for($seller->user)
            ->has(CollectionItem::factory()->approved()->count(20), 'items')
            ->create();

        /** @var CollectionItem $testCollectionItem */
        $testCollectionItem = $collection->items()->first();

        $startTime = $this->getTestStartTime();
        $utcTime = Carbon::make($startTime)->setSecond(0)->setTimezone('UTC');
        $periodMinutes = 60;

        $this->actingAs($collection->user)
            ->postJson(self::BASE_ROUTE, [
                'collection_item_id' => $testCollectionItem->uuid,
                'starts' => $startTime,
                'period_minutes' => $periodMinutes,
                'reserve_price' => 10.59,
                'starting_price' => 8.55,
                'currency_id' => AuctionFactory::getRandomCurrencyId()
            ])
            ->assertCreated()
            ->assertJsonPath('data.starts', $utcTime->format(\DateTimeInterface::ATOM))
            ->assertJsonPath('data.ends', $utcTime->addMinutes($periodMinutes)->format(\DateTimeInterface::ATOM));

        /** @var Auction $auction */
        $auction = Auction::first();
        $this->assertTrue($auction->reserve_price->getAstInteger() === Money::make(10.59, $auction->currency)->getAstInteger());
        $this->assertTrue($auction->starting_price->getAstInteger() === Money::make(8.55, $auction->currency)->getAstInteger());
    }
}
