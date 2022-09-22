<?php

use App\Http\Controllers\V1\Categories\CategoriesViewController;

Route::prefix('categories')
    ->name('categories.')
    ->group(function () {
        Route::get('/', [CategoriesViewController::class, 'list'])
            ->name('list');
    });
