<?php

namespace App\Models;

use App\Enums\SocialNetworkEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

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
class CollectionSocialNetwork extends Model implements SocialNetworkInterface
{
    protected $fillable = [
        'network',
        'link',
    ];

    protected $casts = [
        'network' => SocialNetworkEnum::class
    ];
}
