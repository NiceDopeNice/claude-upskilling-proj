<?php

use App\Http\Controllers\CustomerCommentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerOrganizationController;
use App\Http\Controllers\CustomerReminderController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['message' => 'Laravel API is running!']));

Route::prefix('customers')->group(function () {

    Route::get('/reminder-types', [CustomerReminderController::class, 'types']);

    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/{id}', [CustomerController::class, 'show'])->where('id', '[0-9]+');
    Route::put('/{id}', [CustomerController::class, 'update'])->where('id', '[0-9]+');
    Route::get('/{id}/orders', [CustomerController::class, 'orders'])->where('id', '[0-9]+');
    Route::get('/{id}/orders/{state}', [CustomerController::class, 'ordersByState'])->where('id', '[0-9]+');
    Route::get('/{id}/subscriptions/{state}', [CustomerController::class, 'subscriptions'])->where('id', '[0-9]+');

    // Comments
    Route::get('/{customerId}/comments', [CustomerCommentController::class, 'index'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/comments', [CustomerCommentController::class, 'store'])->where('customerId', '[0-9]+');
    Route::put('/{customerId}/comments/{id}', [CustomerCommentController::class, 'update'])->where(['customerId' => '[0-9]+', 'id' => '[0-9]+']);
    Route::delete('/{customerId}/comments/{id}', [CustomerCommentController::class, 'destroy'])->where(['customerId' => '[0-9]+', 'id' => '[0-9]+']);

    // Reminders
    Route::get('/{customerId}/reminders', [CustomerReminderController::class, 'index'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/reminders', [CustomerReminderController::class, 'store'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/reminders/{id}/deactivate', [CustomerReminderController::class, 'deactivate'])->where(['customerId' => '[0-9]+', 'id' => '[0-9]+']);
    Route::get('/{customerId}/reminders/{id}/sends', [CustomerReminderController::class, 'sends'])->where(['customerId' => '[0-9]+', 'id' => '[0-9]+']);

    // Organization
    Route::get('/{customerId}/organization', [CustomerOrganizationController::class, 'show'])->where('customerId', '[0-9]+');
    Route::put('/{customerId}/organization', [CustomerOrganizationController::class, 'upsert'])->where('customerId', '[0-9]+');
});
