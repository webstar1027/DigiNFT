<?php

use App\Http\Controllers\V1\Admin\Seller\ProcessApprovalSellerController;
use Illuminate\Support\Facades\Route;

Route::prefix('sellers')
    ->name('sellers.')
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::post('/process-approval/{user}', [ProcessApprovalSellerController::class, 'processRequest'])
            ->name('process-approval');
    });
