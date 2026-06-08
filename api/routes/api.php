<?php

use App\Modules\Customer\Controllers\BlockedSsnController;
use App\Modules\Customer\Controllers\CustomerChangeController;
use App\Modules\Customer\Controllers\CustomerCommentController;
use App\Modules\Customer\Controllers\CustomerController;
use App\Modules\Customer\Controllers\CustomerOrganizationController;
use App\Modules\Customer\Controllers\CustomerReminderController;
use App\Modules\Customer\Controllers\FamilyMemberController;
use App\Modules\Customer\Controllers\GdprCustomerController;
use App\Modules\Customer\Controllers\SinfridController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['message' => 'Laravel API is running!']));

// GDPR Management
Route::prefix('gdpr')->group(function () {
    Route::get('/', [GdprCustomerController::class, 'index']);
    Route::get('/exclusion-types', [GdprCustomerController::class, 'exclusionTypes']);
    Route::post('/flag', [GdprCustomerController::class, 'flag']);
    Route::post('/bulk-action', [GdprCustomerController::class, 'bulkAction']);
    Route::delete('/{customerId}', [GdprCustomerController::class, 'unflag'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/anonymize', [GdprCustomerController::class, 'anonymize'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/restore', [GdprCustomerController::class, 'restore'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/reject', [GdprCustomerController::class, 'reject'])->where('customerId', '[0-9]+');
});

Route::prefix('customers')->group(function () {

    Route::get('/reminder-types', [CustomerReminderController::class, 'types']);

    // Blocked SSN
    Route::get('/blocked-ssn', [BlockedSsnController::class, 'index']);
    Route::post('/blocked-ssn', [BlockedSsnController::class, 'store']);
    Route::delete('/blocked-ssn/{id}', [BlockedSsnController::class, 'destroy'])->where('id', '[0-9]+');

    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/{id}', [CustomerController::class, 'show'])->where('id', '[0-9]+');
    Route::put('/{id}', [CustomerController::class, 'update'])->where('id', '[0-9]+');
    Route::get('/{id}/orders', [CustomerController::class, 'orders'])->where('id', '[0-9]+');
    Route::get('/{id}/orders/{state}', [CustomerController::class, 'ordersByState'])->where('id', '[0-9]+');
    Route::get('/{id}/subscriptions/{state}', [CustomerController::class, 'subscriptions'])->where('id', '[0-9]+');

    // Changes
    Route::get('/{customerId}/changes', [CustomerChangeController::class, 'index'])->where('customerId', '[0-9]+');

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

    // Family Members
    Route::get('/{customerId}/family-members', [FamilyMemberController::class, 'index'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/family-members', [FamilyMemberController::class, 'store'])->where('customerId', '[0-9]+');
    Route::put('/{customerId}/family-members/{id}', [FamilyMemberController::class, 'update'])->where(['customerId' => '[0-9]+', 'id' => '[0-9]+']);
    Route::delete('/{customerId}/family-members/{id}', [FamilyMemberController::class, 'destroy'])->where(['customerId' => '[0-9]+', 'id' => '[0-9]+']);

    // Organization
    Route::get('/{customerId}/organization', [CustomerOrganizationController::class, 'show'])->where('customerId', '[0-9]+');
    Route::put('/{customerId}/organization', [CustomerOrganizationController::class, 'upsert'])->where('customerId', '[0-9]+');

    // Sinfrid
    Route::get('/{customerId}/sinfrid', [SinfridController::class, 'account'])->where('customerId', '[0-9]+');
    Route::put('/{customerId}/sinfrid', [SinfridController::class, 'updateAccount'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/sinfrid/deactivate', [SinfridController::class, 'deactivateAccount'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/sinfrid/reactivate', [SinfridController::class, 'reactivateAccount'])->where('customerId', '[0-9]+');
    Route::delete('/{customerId}/sinfrid', [SinfridController::class, 'deleteAccount'])->where('customerId', '[0-9]+');
    Route::get('/{customerId}/sinfrid/members', [SinfridController::class, 'members'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/sinfrid/members', [SinfridController::class, 'addMember'])->where('customerId', '[0-9]+');
    Route::put('/{customerId}/sinfrid/members/{memberId}', [SinfridController::class, 'updateMember'])->where(['customerId' => '[0-9]+', 'memberId' => '[0-9]+']);
    Route::delete('/{customerId}/sinfrid/members/{memberId}', [SinfridController::class, 'removeMember'])->where(['customerId' => '[0-9]+', 'memberId' => '[0-9]+']);
    Route::get('/{customerId}/sinfrid/alarms', [SinfridController::class, 'alarms'])->where('customerId', '[0-9]+');
    Route::get('/{customerId}/sinfrid/policies', [SinfridController::class, 'policies'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/sinfrid/policies', [SinfridController::class, 'createPolicy'])->where('customerId', '[0-9]+');
    Route::post('/{customerId}/sinfrid/policies/{policyId}/cancel', [SinfridController::class, 'cancelPolicy'])->where(['customerId' => '[0-9]+', 'policyId' => '[a-zA-Z0-9]+']);
});
