<?php

namespace Tests\Feature\V1\Collections;

use App\Enums\StorageDisk;
use App\Models\Collection;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class CollectionCreationTest extends AbstractBase
{

    private function getBase64Image(string $type): string
    {
        return match ($type) {
            'logo' => file_get_contents(base_path('tests/test-base64-logo-image.txt')),
            'banner' => file_get_contents(base_path('tests/test-base64-banner-image.txt')),
            'fake' => base64_encode(file_get_contents(base_path('tests/test-base64-script.php'))),
            default => ''
        };
    }

    private function getTestData(bool $fakeImage): array
    {
        return [
            'name' => 'test Collection',
            'description' => 'Test description',
            'private' => false,
            'logo_image' => $this->getBase64Image($fakeImage ? 'fake' : 'logo'),
            'banner_image' => $this->getBase64Image($fakeImage ? 'fake' : 'banner'),
        ];
    }

    public function testUnauthenticatedUsersCanNotAddCollection()
    {
        $testData = $this->getTestData(false);
        $this->postJson(self::BASE_ROUTE, $testData)
            ->assertUnauthorized();
    }

    public function testUsersCanCreateCollections()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->create();
        $testData = $this->getTestData(false);
        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $testData
            )
            ->assertCreated();
        /** @var Collection $collection */
        $collection = $user->collections()->first();
        $this->assertTrue($collection->image_logo !== null);
        $this->assertTrue($collection->image_banner !== null);
        Storage::disk(StorageDisk::PUBLIC->value)->assertExists($collection->image_logo);
        Storage::disk(StorageDisk::PUBLIC->value)->assertExists($collection->image_banner);
    }

    public function testCollectionFailsValidationForNonImage()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->create();
        $data = $this->getTestData(true);

        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $data
            )
            ->assertUnprocessable()
            ->assertJsonPath('errors.logo_image.0', 'The logo image must be a valid image and not exceed 10MB.')
            ->assertJsonPath('errors.banner_image.0', 'The banner image must be a valid image and not exceed 10MB.');
    }

    public function testCollectionCanNotBeAddedWhenUserHasNotVerifiedEmail()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->unverified()->create();
        $data = $this->getTestData(false);

        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $data
            )
            ->assertForbidden();
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

        /** @var User $user */
        $user = User::factory()->create();
        $data = $this->getTestData(false);

        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $data
            )
            ->assertStatus(Response::HTTP_INTERNAL_SERVER_ERROR);
        $this->assertDatabaseMissing('collections', [
            'user_id' => $user->id,
            'name' => $data['name'],
        ]);
    }

    public function testValidationFailsWithIncorrectSocialAccounts()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->create();
        $socialAccounts = [
            'socialNetworks' => [
                ['network' => 'twitter']
            ]
        ];
        $testData = array_merge($this->getTestData(false), $socialAccounts);
        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $testData
            )
            ->assertUnprocessable()
            ->assertJsonPath('errors.socialNetworks.0', "The social networks passed are not in the correct format. Expected array with 'network' and 'link' keys");
    }

    public function testValidationFailsWithUnknownSocialAccounts()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->create();
        $socialAccounts = [
            'socialNetworks' => [
                ['network' => 'what is this?']
            ]
        ];
        $testData = array_merge($this->getTestData(false), $socialAccounts);
        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $testData
            )
            ->assertUnprocessable()
            ->assertJsonPath('errors.socialNetworks.0', "The social networks passed are not in the correct format. Expected array with 'network' and 'link' keys");
    }

    public function testValidationFailsWithDuplicateSocialAccounts()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->create();
        $socialAccounts = [
            'socialNetworks' => [
                ['network' => 'twitter', 'link' => '/something'],
                ['network' => 'twitter', 'link' => '/something'],
            ]
        ];
        $testData = array_merge($this->getTestData(false), $socialAccounts);
        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $testData
            )
            ->assertUnprocessable()
            ->assertJsonPath('errors.socialNetworks.0', 'The social networks field has a duplicate value.');
    }

    public function testCollectionCanBeAddedWithSocialAccounts()
    {
        Storage::fake(StorageDisk::PUBLIC->value);
        /** @var User $user */
        $user = User::factory()->create();
        $socialAccounts = [
            'socialNetworks' => [
                ['network' => 'twitter', 'link' => '/something'],
                ['network' => 'instagram', 'link' => '/something'],
            ]
        ];
        $testData = array_merge($this->getTestData(false), $socialAccounts);
        $this->actingAs($user)
            ->postJson(
                self::BASE_ROUTE,
                $testData
            )
            ->assertCreated();
        /** @var Collection $collection */
        $collection = $user->collections()->first();
        $this->assertTrue($collection->socialNetworks()->count() === 2);
    }
}
