<?php

namespace App\Repositories;

use App\Enums\CollectionItemStatus;
use App\Models\Collection as DigiCollection;
use App\Models\CollectionItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CollectionItemRepository
{
    private function defaultRelations(): array
    {
        return ['collection', 'category'];
    }

    public function getItems(int $perPage, DigiCollection $collection, array $statuses): LengthAwarePaginator
    {
        $query = $collection->items()
            ->with($this->defaultRelations());
        if (!empty($statuses)) {
            $query->whereIn('status', $statuses);
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function getAllItems(int $perPage, array $statuses): LengthAwarePaginator
    {
        return CollectionItem::with($this->defaultRelations())
            ->whereIn('status', $statuses)
            ->paginate($perPage)
            ->withQueryString();
    }
}
