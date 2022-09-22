<?php

namespace App\Services;

use App\DTO\ImageConfig;
use App\Enums\CollectionItemStatus;
use App\Enums\ImageLocations;
use App\Enums\StorageDisk;
use App\Exceptions\CollectionItemSaveFailedException;
use App\Models\Collection as DigiCollection;
use App\Models\CollectionItem;
use App\Repositories\CollectionItemRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CollectionItemService
{
    public function __construct(private ImageService $imageService, private CollectionItemRepository $collectionItemRepository)
    {
    }

    private function getProcessedStatuses(?array $statuses): array
    {
        if ($statuses === null) {
            $statuses = CollectionItemStatus::publicViewableStatus(true);
        }
        $inStatues = [];
        foreach ($statuses as $status) {
            if ($status instanceof CollectionItemStatus) {
                $inStatues[] = $status->value;
                continue;
            }
            $inStatues[] = $status;
        }
        return $inStatues;
    }

    public function create(DigiCollection $collection, array $data, ?string $base64Image): CollectionItem
    {
        $imageLocation = null;
        DB::beginTransaction();

        try {
            $data['status'] = CollectionItemStatus::PENDING->value;
            /** @var CollectionItem $item */
            $item = $collection->items()->create($data);

            if ($base64Image) {
                $imageConfig = new ImageConfig(
                    ImageLocations::COLLECTION_ITEMS->getPath([$collection->user->uuid, $collection->uuid]),
                    $item->uuid
                );
                $imageLocation = $this->imageService->saveBase64ImageToDisk($base64Image, $imageConfig);
                $item->image = $imageLocation;
                $item->save();
            }
            DB::commit();
            return $item;
        } catch (Throwable $ex) {
            DB::rollBack();
            if ($imageLocation) {
                Storage::disk(StorageDisk::PUBLIC->value)->delete($imageLocation);
            }
            throw new CollectionItemSaveFailedException(message: $ex->getMessage(), previous: $ex);
        }
    }

    public function getItemsForCollection(int $perPage, DigiCollection $collection, ?array $statuses = null): LengthAwarePaginator
    {
        return $this->collectionItemRepository->getItems(
            $perPage,
            $collection,
            $this->getProcessedStatuses($statuses)
        );
    }

    public function getAllItems(int $perPage, ?array $statuses = null): LengthAwarePaginator
    {
        return $this->collectionItemRepository->getAllItems(
            $perPage,
            $this->getProcessedStatuses($statuses)
        );
    }
}
