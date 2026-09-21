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

        // Support Tickets
        Route::get('/tickets', [\App\Http\Controllers\TicketController::class, 'index']);
        Route::post('/tickets', [\App\Http\Controllers\TicketController::class, 'store']);
        Route::get('/tickets/{id}', [\App\Http\Controllers\TicketController::class, 'show']);
        Route::put('/tickets/{id}/status', [\App\Http\Controllers\TicketController::class, 'updateStatus']);
        Route::post('/tickets/{id}/replies', [\App\Http\Controllers\TicketController::class, 'reply']);
    });
    
    // Notifications (All authenticated users)
    Route::get('/notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\API\NotificationController::class, 'unreadCount']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\API\NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
    
    // Profile
    Route::put('/profile', [\App\Http\Controllers\API\ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [\App\Http\Controllers\API\ProfileController::class, 'updatePassword']);
});
