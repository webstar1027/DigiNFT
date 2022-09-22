<?php

use App\Enums\RouteVersionPaths;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->name('admin.')
    ->group(function () {
        $path = RouteVersionPaths::getBasePath(RouteVersionPaths::V1, '/admin');
        foreach (glob(sprintf('%s/*.php', $path)) as $routeFile) {
            require $routeFile;
        }
    });
