<?php

namespace App\Rules;

use App\Enums\SocialNetworkEnum;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Enum;

class SocialNetwork implements Rule
{
    private bool $distinct = true;

    public function passes($attribute, $value): bool
    {
        if (!is_array($value)) {
            return false;
        }
        $processedNetworks = [];
        foreach ($value as $network) {
            if ($this->validateSocialNetwork($network)) {
                return false;
            }
            if (in_array($network['network'], $processedNetworks)) {
                $this->distinct = false;
                return false;
            }
            $processedNetworks[] = $network['network'];
        }

        return true;
    }

    public function message(): string
    {
        return $this->distinct ?
            trans('validation.social_networks') :
            trans('validation.distinct');
    }

    private function validateSocialNetwork(array $network): bool
    {
        return Validator::make($network, [
            'network' => ['required', new Enum(SocialNetworkEnum::class)],
            'link' => ['required', 'string']
        ])->fails();
    }
}
