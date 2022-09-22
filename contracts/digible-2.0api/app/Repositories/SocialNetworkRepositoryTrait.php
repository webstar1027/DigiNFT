<?php

namespace App\Repositories;

use App\Enums\SocialNetworkEnum;
use App\Models\SocialNetworkInterface;
use App\Models\SocialNetworkRelationshipInterface;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\DB;

trait SocialNetworkRepositoryTrait
{
    public function syncSocialNetworks(SocialNetworkRelationshipInterface $model, SupportCollection $socialNetworks): void
    {
        $toAdd = new SupportCollection;
        $toDelete = new SupportCollection;

        foreach ($socialNetworks as $socialNetwork) {
            $collectionSocial = $model->socialNetworks()->where('network', SocialNetworkEnum::from($socialNetwork['network']))->first();
            if ($collectionSocial === null) {
                $toAdd->add($socialNetwork);
            }
        }

        /** @var SocialNetworkInterface $collectionSocial */
        foreach ($model->socialNetworks()->get() as $collectionSocial) {
            if ($socialNetworks->where('network', $collectionSocial->network->value)->isEmpty()) {
                $toDelete->add($collectionSocial->id);
            }
        }

        if ($toAdd->isNotEmpty()) {
            $model->socialNetworks()->createMany($toAdd);
        }
        if ($toDelete->isNotEmpty()) {
            foreach ($toDelete as $id) {
                $network = $model->socialNetworks()->find($id);
                if ($network) {// @phpstan-ignore-line
                    $network->delete();// @phpstan-ignore-line
                }
            }
        }
    }
}
