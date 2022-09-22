<?php

namespace App\Models;

use App\Models\Collection as DigiCollection;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Collection as DbCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string $email
 * @property Carbon $email_verified_at
 * @property string $password
 * @property string $two_factor_secret
 * @property string $two_factor_recovery_codes
 * @property boolean $admin
 * @property string $remember_token
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property SellerProfile|null $sellerProfile
 * @property DbCollection|UserSocialNetwork[] $socialNetworks
 * @property DbCollection|DigiCollection[] $collections
 * @property DbCollection|Auction[] $auctions
 * @property DbCollection|Bid[] $bids
 *
 * @mixin \Eloquent
 */
class User extends Authenticatable implements MustVerifyEmail, SocialNetworkRelationshipInterface
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected static function booted()
    {
        parent::booted();
        static::creating(function (User $user) {
            $user->uuid = Str::orderedUuid()->toString();
        });
    }

    public function resolveRouteBinding($value, $field = null): ?Model
    {
        return $this->with(['SellerProfile', 'socialNetworks'])
            ->where($field ?? 'uuid', $value)
            ->first();
    }

    public function isAdmin(): bool
    {
        return $this->admin == true;
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function socialNetworks(): HasMany
    {
        return $this->hasMany(UserSocialNetwork::class);
    }

    public function sellerProfile(): HasOne
    {
        return $this->hasOne(SellerProfile::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(DigiCollection::class);
    }

    public function auctions(): HasMany
    {
        return $this->hasMany(Auction::class);
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }

    public function isSeller(): bool
    {
        return $this->sellerProfile !== null;
    }

    public function isSellerActive(): bool
    {
        return $this->isSeller() && $this->sellerProfile?->isApproved();
    }
}
