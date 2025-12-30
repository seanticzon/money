<?php

use App\Services\AccountService;
use App\Services\BudgetService;
use App\Services\CategoryService;
use App\Services\DashboardService;
use App\Services\GoalService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // =====================
    // Pages
    // =====================
    
    Route::get('dashboard', function (DashboardService $dashboardService) {
        return Inertia::render('dashboard', [
            'data' => $dashboardService->getDashboardData(auth()->user()),
            'comparison' => $dashboardService->getStatsComparison(auth()->user()),
        ]);
    })->name('dashboard');

    Route::get('expenses', function (TransactionService $transactionService, CategoryService $categoryService, AccountService $accountService) {
        $user = auth()->user();
        $month = request('month', now()->month);
        $year = request('year', now()->year);

        return Inertia::render('expenses/index', [
            'transactions' => $transactionService->getAllForUser($user, [
                'type' => 'expense',
                'month' => $month,
                'year' => $year,
            ]),
            'categories' => $categoryService->getExpenseCategories($user),
            'accounts' => $accountService->getAllForUser($user),
            'summary' => $transactionService->getMonthlySummary($user, $month, $year),
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ],
        ]);
    })->name('expenses');

    Route::get('income', function (TransactionService $transactionService, CategoryService $categoryService, AccountService $accountService) {
        $user = auth()->user();
        $month = request('month', now()->month);
        $year = request('year', now()->year);

        return Inertia::render('income/index', [
            'transactions' => $transactionService->getAllForUser($user, [
                'type' => 'income',
                'month' => $month,
                'year' => $year,
            ]),
            'categories' => $categoryService->getIncomeCategories($user),
            'accounts' => $accountService->getAllForUser($user),
            'summary' => $transactionService->getMonthlySummary($user, $month, $year),
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ],
        ]);
    })->name('income');

    Route::get('accounts', function (AccountService $accountService) {
        return Inertia::render('accounts/index', [
            'data' => $accountService->getAccountsSummary(auth()->user()),
        ]);
    })->name('accounts');

    Route::get('budgets', function (BudgetService $budgetService, CategoryService $categoryService) {
        $user = auth()->user();
        $month = request('month', now()->month);
        $year = request('year', now()->year);

        return Inertia::render('budgets/index', [
            'data' => $budgetService->getBudgetSummary($user, $month, $year),
            'categories' => $categoryService->getExpenseCategories($user),
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
            ],
        ]);
    })->name('budgets');

    Route::get('goals', function (GoalService $goalService, AccountService $accountService) {
        return Inertia::render('goals/index', [
            'data' => $goalService->getGoalsSummary(auth()->user()),
            'accounts' => $accountService->getAllForUser(auth()->user()),
        ]);
    })->name('goals');

    // =====================
    // Transaction CRUD
    // =====================
    
    Route::post('transactions', function (TransactionService $transactionService, Request $request) {
        $validated = $request->validate([
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required|exists:categories,id',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();

        match ($validated['type']) {
            'income' => $transactionService->createIncome($user, $validated),
            'expense' => $transactionService->createExpense($user, $validated),
            'transfer' => $transactionService->createTransfer($user, $validated),
        };

        return redirect()->back()->with('success', ucfirst($validated['type']) . ' added successfully');
    })->name('transactions.store');

    Route::put('transactions/{id}', function (TransactionService $transactionService, int $id, Request $request) {
        $user = auth()->user();
        $transaction = $transactionService->getById($user, $id);

        if (!$transaction) {
            return redirect()->back()->with('error', 'Transaction not found');
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'description' => 'sometimes|string|max:255',
            'account_id' => 'sometimes|exists:accounts,id',
            'category_id' => 'sometimes|exists:categories,id',
            'transaction_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $transactionService->update($transaction, $validated);

        return redirect()->back()->with('success', 'Transaction updated successfully');
    })->name('transactions.update');

    Route::delete('transactions/{id}', function (TransactionService $transactionService, int $id) {
        $user = auth()->user();
        $transaction = $transactionService->getById($user, $id);

        if (!$transaction) {
            return redirect()->back()->with('error', 'Transaction not found');
        }

        $transactionService->delete($transaction);

        return redirect()->back()->with('success', 'Transaction deleted successfully');
    })->name('transactions.destroy');

    // =====================
    // Account CRUD
    // =====================
    
    Route::post('accounts', function (AccountService $accountService, Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank,ewallet,cash,credit_card',
            'balance' => 'nullable|numeric',
            'color' => 'nullable|string|max:50',
        ]);

        $accountService->create(auth()->user(), $validated);

        return redirect()->back()->with('success', 'Account created successfully');
    })->name('accounts.store');

    Route::put('accounts/{id}', function (AccountService $accountService, int $id, Request $request) {
        $user = auth()->user();
        $account = $accountService->getById($user, $id);

        if (!$account) {
            return redirect()->back()->with('error', 'Account not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:bank,ewallet,cash,credit_card',
            'color' => 'nullable|string|max:50',
        ]);

        $accountService->update($account, $validated);

        return redirect()->back()->with('success', 'Account updated successfully');
    })->name('accounts.update');

    Route::delete('accounts/{id}', function (AccountService $accountService, int $id) {
        $user = auth()->user();
        $account = $accountService->getById($user, $id);

        if (!$account) {
            return redirect()->back()->with('error', 'Account not found');
        }

        $accountService->delete($account);

        return redirect()->back()->with('success', 'Account deleted successfully');
    })->name('accounts.destroy');

    // =====================
    // Budget CRUD
    // =====================
    
    Route::post('budgets', function (BudgetService $budgetService, Request $request) {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $budgetService->create(auth()->user(), $validated);

        return redirect()->back()->with('success', 'Budget created successfully');
    })->name('budgets.store');

    Route::put('budgets/{id}', function (BudgetService $budgetService, int $id, Request $request) {
        $user = auth()->user();
        $budget = $budgetService->getById($user, $id);

        if (!$budget) {
            return redirect()->back()->with('error', 'Budget not found');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $budgetService->update($budget, $validated);

        return redirect()->back()->with('success', 'Budget updated successfully');
    })->name('budgets.update');

    Route::delete('budgets/{id}', function (BudgetService $budgetService, int $id) {
        $user = auth()->user();
        $budget = $budgetService->getById($user, $id);

        if (!$budget) {
            return redirect()->back()->with('error', 'Budget not found');
        }

        $budgetService->delete($budget);

        return redirect()->back()->with('success', 'Budget deleted successfully');
    })->name('budgets.destroy');

    Route::post('budgets/copy-to-next-month', function (BudgetService $budgetService, Request $request) {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $budgetService->copyBudgetsToNextMonth(auth()->user(), $month, $year);

        $nextMonth = $month == 12 ? 1 : $month + 1;
        $nextYear = $month == 12 ? $year + 1 : $year;

        return redirect()
            ->route('budgets', ['month' => $nextMonth, 'year' => $nextYear])
            ->with('success', 'Budgets copied to next month');
    })->name('budgets.copy');

    // =====================
    // Goal CRUD
    // =====================
    
    Route::post('goals', function (GoalService $goalService, Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'monthly_target' => 'nullable|numeric|min:0',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $goalService->create(auth()->user(), $validated);

        return redirect()->back()->with('success', 'Goal created successfully');
    })->name('goals.store');

    Route::put('goals/{id}', function (GoalService $goalService, int $id, Request $request) {
        $user = auth()->user();
        $goal = $goalService->getById($user, $id);

        if (!$goal) {
            return redirect()->back()->with('error', 'Goal not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:0.01',
            'deadline' => 'nullable|date',
            'monthly_target' => 'nullable|numeric|min:0',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $goalService->update($goal, $validated);

        return redirect()->back()->with('success', 'Goal updated successfully');
    })->name('goals.update');

    Route::delete('goals/{id}', function (GoalService $goalService, int $id) {
        $user = auth()->user();
        $goal = $goalService->getById($user, $id);

        if (!$goal) {
            return redirect()->back()->with('error', 'Goal not found');
        }

        $goalService->delete($goal);

        return redirect()->back()->with('success', 'Goal deleted successfully');
    })->name('goals.destroy');

    Route::post('goals/{id}/add-funds', function (GoalService $goalService, int $id, Request $request) {
        $user = auth()->user();
        $goal = $goalService->getById($user, $id);

        if (!$goal) {
            return redirect()->back()->with('error', 'Goal not found');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'account_id' => 'nullable|exists:accounts,id',
            'notes' => 'nullable|string|max:255',
            'allocation_date' => 'nullable|date',
        ]);

        $goalService->addFunds($goal, $validated);

        return redirect()->back()->with('success', 'Funds added successfully');
    })->name('goals.add-funds');

    Route::post('goals/{id}/withdraw-funds', function (GoalService $goalService, int $id, Request $request) {
        $user = auth()->user();
        $goal = $goalService->getById($user, $id);

        if (!$goal) {
            return redirect()->back()->with('error', 'Goal not found');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $goal->current_amount,
            'account_id' => 'nullable|exists:accounts,id',
            'notes' => 'nullable|string|max:255',
            'allocation_date' => 'nullable|date',
        ]);

        $goalService->withdrawFunds($goal, $validated);

        return redirect()->back()->with('success', 'Funds withdrawn successfully');
    })->name('goals.withdraw-funds');
});

require __DIR__.'/settings.php';