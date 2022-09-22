<?php

namespace App\Transformers;

use App\Enums\StorageDisk;
use App\Models\Collection as DigiCollection;
use Illuminate\Support\Facades\Storage;
use League\Fractal\TransformerAbstract;

class UserCollectionTransformer extends TransformerAbstract
{
    public function transform(DigiCollection $collection): array
    {
        return [
            'id' => $collection->uuid,
            'name' => $collection->name,
            'description' => $collection->description,
            'private' => $collection->private,
            'logo' => $collection->image_logo ?
                Storage::disk(StorageDisk::PUBLIC->value)->url($collection->image_logo)
                : null,
            'banner' => $collection->image_banner ?
                Storage::disk(StorageDisk::PUBLIC->value)->url($collection->image_banner)
                : null
        ];
    }
}
