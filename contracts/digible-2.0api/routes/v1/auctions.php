<?php

use App\Http\Controllers\V1\Auctions\AuctionCreateController;
use App\Http\Controllers\V1\Auctions\AuctionViewController;
use App\Http\Controllers\V1\Auctions\PlaceBidController;

Route::prefix('auctions')
    ->name('auctions.')
    ->group(function () {

        Route::middleware(['auth:sanctum', 'verified'])
            ->group(function() {
                Route::post('/', [AuctionCreateController::class, 'create'])
                    ->name('create');
                Route::post('/{auction:uuid}/bid', [PlaceBidController::class, 'processBid'])
                    ->name('bid');
            });

        Route::get('/', [AuctionViewController::class, 'listAuctions'])
            ->name('list');
        Route::get('/{auction:uuid}', [AuctionViewController::class, 'getAuction'])
            ->name('view');
    });
