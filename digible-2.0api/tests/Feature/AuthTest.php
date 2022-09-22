<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use WithFaker, RefreshDatabase;

    private string $email;

    public function setUp(): void
    {
        parent::setUp();
        $this->email = $this->faker->email;
    }

    private function registerUser(string $email, array $additional = []): TestResponse
    {
        return $this->postJson(
            'auth/register',
            array_merge(
                [
                    'name' => $this->faker->name(),
                    'email' => $email,
                    'password' => $this->faker->password(10)
                ],
                $additional
            ));
    }

    public function testUserRegistrationFailsValidation()
    {
        $user = User::factory()->make();

        $this->assertDatabaseMissing('users', ['email' => $user->email]);

        $this->postJson('auth/register', ['password' => $this->faker->password(10)])
            ->assertUnprocessable();

        $this->assertDatabaseMissing('users', ['email' => $user->email]);
    }

    public function testRegisteringUserWorks()
    {
        $user = User::factory()->make();

        $this->assertDatabaseMissing('users', ['email' => $user->email]);

        $response = $this->registerUser($user->email);
        $response->assertCreated();

        $this->assertDatabaseHas('users', ['email' => $user->email]);
    }

    public function testUserFailsIfAlreadyRegistered()
    {
        $user = User::factory()->create();

        $response = $this->registerUser($user->email);
        $response->assertUnprocessable();
    }

    public function testVerifyEmailIsSentAndVerifiesUsersEmail()
    {
        $user = User::factory()->unverified()->create();

        $notification = new VerifyEmailNotification();

        $this->assertFalse($user->hasVerifiedEmail());

        $mail = $notification->toMail($user);
        // The URL should be encoded into the app url as the direct verify
        // link should not be sent in an email, so we need to get it out
        $queryParts = explode('=', parse_url($mail->actionUrl)['query']);
        $this->assertTrue($queryParts[0] === 'verify-url');
        $verifyParts = parse_url(urldecode($queryParts[1]));
        $verifyLink = sprintf('%s?%s', $verifyParts['path'], $verifyParts['query']);

        // Simulate clicking on the validation link
        $this->actingAs($user)
            ->get($verifyLink)
            ->assertNoContent();

        // User should have verified their email
        $this->assertTrue(User::find($user->id)->hasVerifiedEmail());
    }

    public function testVerifyEmailCanBeResent()
    {
        $user = User::factory()->unverified()->create();
        Notification::fake();
        $this->actingAs($user)
            ->postJson('auth/email/verification-notification')
            ->assertStatus(Response::HTTP_ACCEPTED);
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function testVerifyEmailIsNotSentWhenAlreadyVerified()
    {
        $user = User::factory()->create();
        Notification::fake();
        $this->actingAs($user)
            ->postJson('auth/email/verification-notification')
            ->assertNoContent();
        Notification::assertNothingSent();
    }

    public function testPasswordResetEmailIsSent()
    {
        $user = User::factory()->create();

        Notification::fake();
        Notification::assertNothingSent();
        $response = $this->postJson(
            'auth/forgot-password',
            [
                'email' => $user->email
            ]
        );
        $response->assertOk();
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function testUsersCanChangesPassword()
    {
        $user = User::factory()->create();

        do {
            // Just ensure the new password doesn't match the current
            // users one, it never should, but belt and braces
            $newPassword = $this->faker->password(8);
        } while (Hash::check($newPassword, $user->password));

        /** @var PasswordBroker $broker */
        $broker = Password::broker();

        $notification = new ResetPasswordNotification($broker->createToken($user));

        $mail = $notification->toMail($user);
        $queryParts = [];
        // We only want the token and email sections from the url
        foreach (explode('&', parse_url($mail->actionUrl)['query']) as $param) {
            $params = explode('=', $param);
            $queryParts[$params[0]] = $params[1];
        }
        $this->assertArrayHasKey('token', $queryParts);
        $this->assertArrayHasKey('email', $queryParts);

        $data = [
            'token' => $queryParts['token'],
            'email' => $queryParts['email'],
            'password' => $newPassword
        ];
        $route = 'auth/reset-password';

        $this->postJson($route, $data)->assertUnprocessable();
        $data['email'] = urldecode($data['email']);
        $this->postJson($route, $data)->assertOk();

        $this->assertTrue(Hash::check($newPassword, User::find($user->id)->password));
    }

    public function testUsersLoginFailsValidation()
    {
        $user = User::factory()->create();
        $response = $this->postJson(
            'auth/login',
            [
                'email' => $user->email,
                'password' => 'password'
            ]
        );
        $response->assertUnprocessable();
    }

    public function testLoggedInUserCanUpdatePassword()
    {
        $newPassword = 'password123';
        $this->putJson('auth/user/password',
            ['current_password' => 'this is wrong', 'password' => $newPassword]
        )->assertUnauthorized();

        $user = User::factory()->create([
            'password' => Hash::make('password')
        ]);
        $this->actingAs($user)
            ->putJson('auth/user/password',
                ['current_password' => 'this is wrong', 'password' => $newPassword]
            )->assertUnprocessable();
        $this->actingAs($user)
            ->putJson('auth/user/password',
                ['current_password' => 'password', 'password' => $newPassword]
            )->assertOk();
        $this->assertTrue(Hash::check($newPassword, User::find($user->id)->password));
    }
}
