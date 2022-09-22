<?php

use App\Http\Controllers\V1\Items\AllItemsController;

Route::prefix('collection-items')
    ->name('collection-items.')
    ->group(function () {

        Route::get('/', [AllItemsController::class, 'listAll'])
            ->name('list');
    });
