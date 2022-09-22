<?php

namespace App\Services;

use App\DTO\ImageConfig;
use App\Enums\ImageLocations;
use App\Enums\StorageDisk;
use App\Exceptions\CollectionSaveFailedException;
use App\Models\Collection as DigiCollection;
use App\Models\User;
use App\Repositories\CollectionRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\ArrayShape;
use Throwable;

class CollectionService
{
    public function __construct(private ImageService $imageService, private CollectionRepository $collectionRepository)
    {
    }

    public function getCollectionsForUser(int $perPage, User $user, bool $excludePrivate = true): LengthAwarePaginator
    {
        return $this->collectionRepository->getCollectionForUser($perPage, $user, $excludePrivate);
    }

    public function getAllPublic(int $perPage): LengthAwarePaginator
    {
        return $this->collectionRepository->getAllPublic($perPage);
    }

    /**
     * @throws CollectionSaveFailedException|Throwable
     */
    public function create(User $user, array $data): DigiCollection
    {
        $imageLocations = [];
        DB::beginTransaction();

        try {
            $data = $this->sanitiseDataForCreation($data, $user);
            $imageLocations = $this->generateImagesFromSanitisedData($data['data'], $user);
            $data['data'] = array_merge($data['data'], $imageLocations);
            $collection = $this->collectionRepository->create($user, $data['data']);
            $this->collectionRepository->syncSocialNetworks($collection, new Collection($data['social']));

            DB::commit();
            return $collection;
        } catch (Throwable $ex) {
            DB::rollBack();
            foreach ($imageLocations as $imageLocation) {
                Storage::disk(StorageDisk::PUBLIC->value)->delete($imageLocation);
            }
            throw new CollectionSaveFailedException(message: $ex->getMessage(), previous: $ex);
        }
    }

    private function sanitiseDataForCreation(array $data, User $user): array
    {
        return [
            'data' => [
                'uuid' => Str::orderedUuid()->toString(),
                'user_id'=> $user->id,
                'name' => $data['name'],
                'image_logo' => $data['logo_image'],
                'image_banner' => $data['banner_image'],
                'description' => $data['description'],
                'private' => $data['private'] ?? false,
            ],
            'social' => $data['socialNetworks'] ?? []
        ];
    }

    private function generateImagesFromSanitisedData(array $data, User $user): array
    {
        $imageLocation = [];
        $images = [
            'image_logo' => $data['image_logo'],
            'image_banner' => $data['image_banner'],
        ];
        foreach ($images as $imageType => $imageString) {
            $imageConfig = new ImageConfig(
                ImageLocations::COLLECTIONS->getPath([$user->uuid]),
                $data['uuid'] . '-' . str_replace(['image', '_'], '', $imageType)
            );
            $imageLocation[$imageType] = $this->imageService->saveBase64ImageToDisk($imageString, $imageConfig);
        }

        return $imageLocation;
    }
}
