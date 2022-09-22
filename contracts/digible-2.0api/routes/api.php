<?php

use App\Enums\RouteVersionPaths;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group([
    'domain' => config('fortify.domain', null),
    'prefix' => config('fortify.prefix'),
], function () {
    require base_path('routes/auth.php');
});

Route::prefix('v1')
    ->name('v1.')
    ->group(function () {
        $path = RouteVersionPaths::getBasePath(RouteVersionPaths::V1);
        foreach (glob(sprintf('%s/*.php', $path)) as $routeFile) {
            require $routeFile;
        }
    });
