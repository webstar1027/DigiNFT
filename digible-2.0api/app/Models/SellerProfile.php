<?php

namespace App\Models;

use App\Enums\SellerStatusEnum;
use App\Enums\SellerTypeEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property SellerTypeEnum $type
 * @property SellerStatusEnum $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property User $user
 *
 * @mixin \Eloquent
 */
class SellerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'status',
    ];

    protected $casts = [
        'type' => SellerTypeEnum::class,
        'status' => SellerStatusEnum::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->status === SellerStatusEnum::APPROVED;
    }
}
