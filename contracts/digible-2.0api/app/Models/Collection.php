<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as DbCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $uuid
 * @property string $name
 * @property string $image_logo
 * @property string $image_banner
 * @property string $description
 * @property boolean $private
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property User $user
 * @property DbCollection|CollectionItem[] $items
 * @property DbCollection|UserSocialNetwork[] $socialNetworks
 *
 * @mixin \Eloquent
 */
class Collection extends AbstractUuidModel implements SocialNetworkRelationshipInterface
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'description',
        'private'
    ];

    protected $casts = [
        'private' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CollectionItem::class);
    }

    public function socialNetworks(): HasMany
    {
        return $this->hasMany(CollectionSocialNetwork::class);
    }
}
