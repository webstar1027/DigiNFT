<?php

use App\Http\Controllers\V1\Collections\CollectionCreateController;
use App\Http\Controllers\V1\Collections\CollectionItemCreateController;
use App\Http\Controllers\V1\Collections\ViewCollectionController;
use App\Http\Controllers\V1\Collections\ViewCollectionItemController;
use Illuminate\Support\Facades\Route;

Route::prefix('collections')
    ->name('collections.')
    ->group(function () {

        Route::get('/', [ViewCollectionController::class, 'listCollections'])
            ->name('list');

        Route::prefix('{collection:uuid}')
            ->group(function() {
                Route::get('/', [ViewCollectionController::class, 'getCollection'])
                    ->name('view');
                Route::prefix('items')
                    ->name('items.')
                    ->group(function() {
                        Route::get('/', [ViewCollectionItemController::class, 'listItems'])
                            ->name('list');
                        Route::get('/{item:uuid}', [ViewCollectionItemController::class, 'getItem'])
                            ->name('view');
                    });
            });

        Route::middleware(['auth:sanctum', 'verified'])
            ->group(function() {
                Route::post('/', [CollectionCreateController::class, 'create'])
                    ->name('create');

                Route::prefix('{collection:uuid}/items')
                    ->name('items.')
                    ->group(function() {
                        Route::post('/', [CollectionItemCreateController::class, 'create'])
                            ->name('create');
                    });
            });
    });
