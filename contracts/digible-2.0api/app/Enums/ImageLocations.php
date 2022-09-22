<?php

namespace App\Enums;

use App\Models\User;

enum ImageLocations: string
{
    case COLLECTIONS = '/user/%s/collections/';
    case COLLECTION_ITEMS = '/user/%s/collections/%s/items/';

    public function getPath(array $values): string
    {
        return vsprintf($this->value, $values);
    }
}
