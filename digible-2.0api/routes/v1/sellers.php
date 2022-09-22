<?php

use App\Http\Controllers\V1\Seller\SellerRequestController;
use App\Http\Controllers\V1\Seller\ViewSellersController;
use Illuminate\Support\Facades\Route;

Route::prefix('sellers')
    ->name('sellers.')
    ->group(function () {
        Route::middleware(['auth:sanctum', 'verified'])
            ->group(function() {
                Route::post('/', [SellerRequestController::class, 'createSellerAccount'])
                    ->name('create');
            });
        Route::get('/', [ViewSellersController::class, 'listSellers'])
            ->name('list');
        Route::get('/{user}', [ViewSellersController::class, 'getSeller'])
            ->name('view');
    });
