<?php

namespace App\Models;

use App\Enums\SocialNetworkEnum;
use Carbon\Carbon;

/**
 * @property int $id
 * @property int $collection_id
 * @property SocialNetworkEnum $network
 * @property string $link
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @mixin \Eloquent
 */
interface SocialNetworkInterface
{

}
