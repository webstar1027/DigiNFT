<?php

namespace Tests\Feature\V1\Users;

use App\Models\User;

class UserDetailsTest extends AbstractBase
{
    public function testUnauthenticatedCanNotViewDetails()
    {
        $this->getJson(self::BASE_ROUTE . '/details')
            ->assertUnauthorized();
    }

    public function testUserCanViewTheirDetails()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/details')
            ->assertOk()
            ->assertJsonPath('data.id', $user->uuid)
            ->assertJsonPath('data.name', $user->name)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.verified', true);
    }

    public function testUnverifiedUserCanViewTheirDetails()
    {
        /** @var User $user */
        $user = User::factory()->unverified()->create();
        $this->actingAs($user)
            ->getJson(self::BASE_ROUTE . '/details')
            ->assertOk()
            ->assertJsonPath('data.id', $user->uuid)
            ->assertJsonPath('data.name', $user->name)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.verified', false);
    }
}
