<?php

namespace App\Transformers;

use App\Enums\StorageDisk;
use App\Models\Collection;
use Illuminate\Support\Facades\Storage;
use League\Fractal\Resource\ResourceInterface;
use League\Fractal\TransformerAbstract;

class CollectionTransformer extends TransformerAbstract
{
    protected $availableIncludes = [
        'userDetails'
    ];

    public function transform(Collection $collection): array
    {
        return [
            'id' => $collection->uuid,
            'name' => $collection->name,
            'description' => $collection->description,
            'logo' => $collection->image_logo ?
                Storage::disk(StorageDisk::PUBLIC->value)->url($collection->image_logo)
                : null,
            'banner' => $collection->image_banner ?
                Storage::disk(StorageDisk::PUBLIC->value)->url($collection->image_banner)
                : null
        ];
    }

    public function includeUserDetails(Collection $collection): ResourceInterface
    {
        return $this->item($collection->user, new UserTransformer);
    }
}
