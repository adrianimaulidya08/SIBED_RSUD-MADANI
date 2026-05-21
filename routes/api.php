<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BedController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Rooms & Beds
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{room}', [RoomController::class, 'show']);
    Route::get('/beds', [BedController::class, 'index']);
    Route::get('/beds/summary', [BedController::class, 'summary']);
    Route::put('/beds/{bed}', [BedController::class, 'update']);

    // Admin-only routes
    Route::middleware(AdminMiddleware::class)->prefix('admin')->group(function () {
        // Room management
        Route::get('/rooms', [AdminController::class, 'indexRooms']);
        Route::post('/rooms', [AdminController::class, 'storeRoom']);
        Route::put('/rooms/{room}', [AdminController::class, 'updateRoom']);
        Route::delete('/rooms/{room}', [AdminController::class, 'destroyRoom']);

        // Class management
        Route::get('/rooms/{room}/classes', [AdminController::class, 'indexClasses']);
        Route::post('/rooms/{room}/classes', [AdminController::class, 'storeClass']);
        Route::put('/classes/{class}', [AdminController::class, 'updateClass']);
        Route::delete('/classes/{class}', [AdminController::class, 'destroyClass']);

        // Bed management
        Route::post('/beds', [AdminController::class, 'storeBed']);
        Route::put('/beds/{bed}', [AdminController::class, 'updateBed']);
        Route::delete('/beds/{bed}', [AdminController::class, 'destroyBed']);

        // User management
        Route::get('/users', [AdminController::class, 'indexUsers']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
    });
});
