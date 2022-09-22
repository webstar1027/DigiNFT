<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property int $decimal_places
 * @property string $symbol
 * @property boolean $active
 * @property boolean $crypto
 *
 * @mixin \Eloquent
 */
class Currency extends Model
{
    public $timestamps = false;
}
