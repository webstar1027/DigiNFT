<?php

namespace App\Models;

use App\Enums\CollectionItemStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as DbCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Collection as DigiCollection;

/**
 * @property int $id
 * @property string $uuid
 * @property int $category_id
 * @property CollectionItemStatus $status
 * @property int $collection_id
 * @property string $name
 * @property ?string $image
 * @property ?string $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property Category $category
 * @property DigiCollection $collection
 * @property DbCollection|Auction[] $auctions
 *
 * @mixin \Eloquent
 */
class CollectionItem extends AbstractUuidModel
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'status',
        'collection_id',
        'name',
        'image',
        'description',
    ];

    protected $casts = [
        'status' => CollectionItemStatus::class
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(DigiCollection::class);
    }

    public function auctions(): HasMany
    {
        return $this->hasMany(Auction::class);
    }
}
