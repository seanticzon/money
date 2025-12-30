<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/comparison', [DashboardController::class, 'comparison']);

    // Accounts
    Route::apiResource('accounts', AccountController::class);

    // Categories
    Route::get('/categories/spending', [CategoryController::class, 'spending']);
    Route::apiResource('categories', CategoryController::class);

    // Transactions
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::apiResource('transactions', TransactionController::class);

    // Budgets
    Route::post('/budgets/copy-to-next-month', [BudgetController::class, 'copyToNextMonth']);
    Route::apiResource('budgets', BudgetController::class);

    // Goals
    Route::post('/goals/{id}/add-funds', [GoalController::class, 'addFunds']);
    Route::post('/goals/{id}/withdraw-funds', [GoalController::class, 'withdrawFunds']);
    Route::apiResource('goals', GoalController::class);

    // User Settings
    Route::get('/settings', [UserSettingController::class, 'show']);
    Route::put('/settings', [UserSettingController::class, 'update']);
});