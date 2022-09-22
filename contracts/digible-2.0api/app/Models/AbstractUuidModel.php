<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property string $uuid
 */
abstract class AbstractUuidModel extends Model
{
    protected static function booted()
    {
        parent::booted();
        static::creating(function (AbstractUuidModel $model) {
            if ($model->uuid === null) {
                $model->uuid = Str::orderedUuid()->toString();
            }
        });
    }
}
