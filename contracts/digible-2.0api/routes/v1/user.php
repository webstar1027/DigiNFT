<?php

use App\Http\Controllers\V1\User\UserCollectionItemsViewController;
use App\Http\Controllers\V1\User\UserCollectionsViewController;
use App\Http\Controllers\V1\User\UserDetailsViewController;

Route::prefix('user')
    ->name('current-user.')
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::get('/details', [UserDetailsViewController::class, 'currentUser'])
            ->name('details');

        Route::prefix('/collections')
            ->name('collections.')
            ->group(function() {
                Route::get('/', [UserCollectionsViewController::class, 'list'])
                    ->name('list');
                Route::prefix('/{collection:uuid}')
                    ->name('collection.')
                    ->group(function() {
                        Route::get('/items', [UserCollectionItemsViewController::class, 'list'])
                            ->name('items');
                    });
            });
    });
