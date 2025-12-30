<?php

namespace App\Services;

use App\Models\User;

class DashboardService
{
    public function __construct(
        protected AccountService $accountService,
        protected TransactionService $transactionService,
        protected BudgetService $budgetService,
        protected GoalService $goalService
    ) {}

    public function getDashboardData(User $user): array
    {
        $month = now()->month;
        $year = now()->year;

        // Get monthly savings goal from user settings
        $monthlySavingsGoal = $user->settings?->monthly_savings_goal ?? 0;

        // Calculate monthly data
        $monthlyIncome = $this->transactionService->getMonthlyIncome($user, $month, $year);
        $monthlyExpenses = $this->transactionService->getMonthlyExpenses($user, $month, $year);
        $projectedSavings = $monthlyIncome - $monthlyExpenses;

        // Check if on track
        $isOnTrack = $projectedSavings >= $monthlySavingsGoal;
        $savingsProgress = $monthlySavingsGoal > 0 
            ? ($projectedSavings / $monthlySavingsGoal) * 100 
            : 0;

        return [
            'stats' => [
                'total_balance' => $this->accountService->getTotalBalance($user),
                'monthly_income' => $monthlyIncome,
                'monthly_expenses' => $monthlyExpenses,
                'projected_savings' => $projectedSavings,
            ],
            'monthly_tracker' => [
                'income' => $monthlyIncome,
                'expenses' => $monthlyExpenses,
                'net_savings' => $projectedSavings,
                'savings_goal' => $monthlySavingsGoal,
                'savings_progress' => min($savingsProgress, 100),
                'is_on_track' => $isOnTrack,
                'shortfall' => $isOnTrack ? 0 : $monthlySavingsGoal - $projectedSavings,
            ],
            'recent_transactions' => $this->transactionService->getRecent($user, 5)->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'description' => $tx->description,
                    'amount' => (float) $tx->amount,
                    'type' => $tx->type,
                    'category' => $tx->category ? [
                        'name' => $tx->category->name,
                        'icon' => $tx->category->icon,
                    ] : null,
                    'account' => [
                        'name' => $tx->account->name,
                    ],
                    'transaction_date' => $tx->transaction_date->format('Y-m-d'),
                ];
            }),
            'budget_status' => $this->budgetService->getBudgetsWithSpending($user, $month, $year),
            'savings_goals' => $this->goalService->getTopGoals($user, 3)->map(function ($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'icon' => $goal->icon,
                    'color' => $goal->color,
                    'target_amount' => (float) $goal->target_amount,
                    'current_amount' => (float) $goal->current_amount,
                    'progress' => round($goal->progress, 1),
                ];
            }),
            'current_month' => [
                'month' => $month,
                'year' => $year,
                'month_name' => now()->format('F Y'),
            ],
        ];
    }

    public function getStatsComparison(User $user): array
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $lastMonth = $currentMonth === 1 ? 12 : $currentMonth - 1;
        $lastYear = $currentMonth === 1 ? $currentYear - 1 : $currentYear;

        $currentIncome = $this->transactionService->getMonthlyIncome($user, $currentMonth, $currentYear);
        $lastIncome = $this->transactionService->getMonthlyIncome($user, $lastMonth, $lastYear);

        $currentExpenses = $this->transactionService->getMonthlyExpenses($user, $currentMonth, $currentYear);
        $lastExpenses = $this->transactionService->getMonthlyExpenses($user, $lastMonth, $lastYear);

        return [
            'income' => [
                'current' => $currentIncome,
                'previous' => $lastIncome,
                'change' => $lastIncome > 0 ? (($currentIncome - $lastIncome) / $lastIncome) * 100 : 0,
                'trend' => $currentIncome >= $lastIncome ? 'up' : 'down',
            ],
            'expenses' => [
                'current' => $currentExpenses,
                'previous' => $lastExpenses,
                'change' => $lastExpenses > 0 ? (($currentExpenses - $lastExpenses) / $lastExpenses) * 100 : 0,
                'trend' => $currentExpenses <= $lastExpenses ? 'up' : 'down', // Lower expenses is good
            ],
            'savings' => [
                'current' => $currentIncome - $currentExpenses,
                'previous' => $lastIncome - $lastExpenses,
                'change' => ($lastIncome - $lastExpenses) != 0 
                    ? ((($currentIncome - $currentExpenses) - ($lastIncome - $lastExpenses)) / abs($lastIncome - $lastExpenses)) * 100 
                    : 0,
                'trend' => ($currentIncome - $currentExpenses) >= ($lastIncome - $lastExpenses) ? 'up' : 'down',
            ],
        ];
    }
}