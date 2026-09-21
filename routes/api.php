<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Admin/Manager routes
    Route::middleware('role:admin,manager')->group(function () {
        // Customers
        Route::get('/customers', [\App\Http\Controllers\API\CustomerController::class, 'index']);
        Route::post('/customers', [\App\Http\Controllers\API\CustomerController::class, 'store']);
        Route::get('/customers/{id}', [\App\Http\Controllers\API\CustomerController::class, 'show']);
        Route::put('/customers/{id}', [\App\Http\Controllers\API\CustomerController::class, 'update']);
        Route::put('/customers/{id}/status', [\App\Http\Controllers\API\CustomerController::class, 'updateStatus']);

        // Subscriptions
        Route::get('/subscriptions', [\App\Http\Controllers\SubscriptionController::class, 'index']);
        Route::post('/subscriptions', [\App\Http\Controllers\SubscriptionController::class, 'store']);
        Route::put('/subscriptions/{id}', [\App\Http\Controllers\SubscriptionController::class, 'update']);
        Route::put('/subscriptions/{id}/cancel', [\App\Http\Controllers\SubscriptionController::class, 'cancel']);

        // Invoices
        Route::get('/invoices', [\App\Http\Controllers\InvoiceController::class, 'index']);
        Route::post('/invoices', [\App\Http\Controllers\InvoiceController::class, 'store']);
        Route::put('/invoices/{id}', [\App\Http\Controllers\InvoiceController::class, 'update']);
        Route::put('/invoices/{id}/status', [\App\Http\Controllers\InvoiceController::class, 'updateStatus']);
    });
});
