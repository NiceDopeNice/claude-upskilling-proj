<?php

use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['message' => 'Laravel API is running!']));

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/{id}', [CustomerController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/{id}/orders', [CustomerController::class, 'orders'])->where('id', '[0-9]+');
});
