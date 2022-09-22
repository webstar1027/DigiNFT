<?php

namespace Tests\Feature\V1\CollectionItems;

use App\Enums\CollectionItemStatus;
use App\Enums\StorageDisk;
use App\Models\Category;
use App\Models\Collection as DigiCollection;
use App\Models\CollectionItem;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class CollectionItemCreateTest extends AbstractBase
{
    private function getBaseUrl(string $collectionUuid): string
    {
        return sprintf(self::BASE_ROUTE, $collectionUuid);
    }

    public function testNonAuthenticatedUserCanNotAddItem()
    {
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()->create();
        $this->postJson($this->getBaseUrl($collection->uuid), ['name' => 'garbage'])
            ->assertUnauthorized();
    }

    public function testUserNotAssignedToCollectionCanNotAddAnItem()
    {
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()->create();
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user)
            ->postJson($this->getBaseUrl($collection->uuid), ['name' => 'garbage'])
            ->assertForbidden();
    }

    public function testUserCanNotAddToNonExistingCollection()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user)
            ->postJson($this->getBaseUrl('not-there'), ['name' => 'garbage'])
            ->assertNotFound();
    }

    public function testUnVerifiedUserCanNotAddCollectionItem()
    {
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()->unverifiedUser()->create();
        $this->actingAs($collection->user)
            ->postJson($this->getBaseUrl($collection->uuid), [])
            ->assertForbidden();
    }

    public function testValidationFailsWhenTryingToAddItemToTheirCollection()
    {
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()->create();
        $this->actingAs($collection->user)
            ->postJson($this->getBaseUrl($collection->uuid), [])
            ->assertUnprocessable()
            ->assertJsonPath('errors.name.0', 'The name field is required.')
            ->assertJsonPath('errors.category.0', 'The category field is required.');
    }

    public function testCollectionItemFailsValidationForNonImage()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var Category $category */
        $category = Category::inRandomOrder()->first();
        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()->create();
        $this->actingAs($collection->user)
            ->postJson($this->getBaseUrl($collection->uuid), [
                'category' => $category->slug,
                'name' => 'test name',
                'image' => base64_encode(file_get_contents(base_path('tests/test-base64-script.php')))
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.image.0', 'The image must be a valid image and not exceed 10MB.');
    }

    public function testUserCanAddItemToCollection()
    {
        Storage::fake(StorageDisk::PUBLIC->value);

        /** @var Category $category */
        $category = Category::inRandomOrder()->first();

        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()
            ->create();
        SellerProfile::factory()->for($collection->user)->create();
        $response = $this->actingAs($collection->user)
            ->postJson($this->getBaseUrl($collection->uuid), [
                'category' => $category->slug,
                'name' => 'test name',
                'image' => file_get_contents(base_path('tests/test-base64-logo-image.txt')),
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'test name')
            ->assertJsonPath('data.category', [
                'data' => [
                    'name' => $category->name,
                    'slug' => $category->slug,
                ]
            ])
            ->assertJsonPath('data.status', CollectionItemStatus::PENDING->getName());
        /** @var CollectionItem $item */
        $item = $collection->items()->first();
        $response->assertJsonPath('data.id', $item->uuid);
        $response->assertJsonPath('data.image', Storage::disk(StorageDisk::PUBLIC->value)->url($item->image));
        $this->assertTrue($item->image !== null);
        Storage::disk(StorageDisk::PUBLIC->value)->assertExists($item->image);
    }

    public function testNothingIsSavedIfTheImageFailsToSaveToDisk()
    {
        $fileSystem = \Mockery::mock(FilesystemAdapter::class);
        Storage::fake(StorageDisk::PUBLIC->value);
        Storage::shouldReceive('disk')
            ->once()
            ->withArgs([StorageDisk::PUBLIC->value])
            ->andReturn($fileSystem);
        $fileSystem->shouldReceive('put')
            ->once()
            ->withAnyArgs()
            ->andReturnFalse();

        /** @var Category $category */
        $category = Category::inRandomOrder()->first();

        /** @var DigiCollection $collection */
        $collection = DigiCollection::factory()->create();
        $this->actingAs($collection->user)
            ->postJson($this->getBaseUrl($collection->uuid), [
                'category' => $category->slug,
                'name' => 'test name',
                'image' => file_get_contents(base_path('tests/test-base64-logo-image.txt')),
            ])
            ->assertStatus(Response::HTTP_INTERNAL_SERVER_ERROR);
        $this->assertDatabaseMissing('collections', [
            'user_id' => $collection->user->id,
            'name' => 'test name',
        ]);
    }
}
