<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property \Illuminate\Database\Eloquent\Collection $socialNetworks
 */
interface SocialNetworkRelationshipInterface
{
    public function socialNetworks(): HasMany;
}
