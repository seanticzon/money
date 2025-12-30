<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class BudgetService
{
    public function getAllForUser(User $user, int $month = null, int $year = null): Collection
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return $user->budgets()
            ->with('category')
            ->where('month', $month)
            ->where('year', $year)
            ->get();
    }

    public function getById(User $user, int $id): ?Budget
    {
        return $user->budgets()->with('category')->find($id);
    }

    public function create(User $user, array $data): Budget
    {
        return $user->budgets()->create([
            'category_id' => $data['category_id'],
            'amount' => $data['amount'],
            'month' => $data['month'] ?? now()->month,
            'year' => $data['year'] ?? now()->year,
        ]);
    }

    public function update(Budget $budget, array $data): Budget
    {
        $budget->update([
            'amount' => $data['amount'] ?? $budget->amount,
        ]);

        return $budget->fresh()->load('category');
    }

    public function delete(Budget $budget): bool
    {
        return $budget->delete();
    }

    public function getBudgetsWithSpending(User $user, int $month = null, int $year = null): array
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        $budgets = $this->getAllForUser($user, $month, $year);

        return $budgets->map(function ($budget) use ($month, $year) {
            $spent = $budget->category->getSpentAmount($month, $year);
            
            return [
                'id' => $budget->id,
                'category' => [
                    'id' => $budget->category->id,
                    'name' => $budget->category->name,
                    'icon' => $budget->category->icon,
                    'color' => $budget->category->color,
                ],
                'amount' => (float) $budget->amount,
                'spent' => $spent,
                'remaining' => (float) $budget->amount - $spent,
                'progress' => $budget->amount > 0 ? min(($spent / $budget->amount) * 100, 100) : 0,
                'is_over_budget' => $spent > $budget->amount,
            ];
        })->toArray();
    }

    public function getBudgetSummary(User $user, int $month = null, int $year = null): array
    {
        $budgetsWithSpending = $this->getBudgetsWithSpending($user, $month, $year);

        $totalBudget = array_sum(array_column($budgetsWithSpending, 'amount'));
        $totalSpent = array_sum(array_column($budgetsWithSpending, 'spent'));

        return [
            'budgets' => $budgetsWithSpending,
            'total_budget' => $totalBudget,
            'total_spent' => $totalSpent,
            'total_remaining' => $totalBudget - $totalSpent,
            'overall_progress' => $totalBudget > 0 ? min(($totalSpent / $totalBudget) * 100, 100) : 0,
        ];
    }

    public function copyBudgetsToNextMonth(User $user, int $fromMonth, int $fromYear): Collection
    {
        $existingBudgets = $this->getAllForUser($user, $fromMonth, $fromYear);
        
        $nextMonth = $fromMonth === 12 ? 1 : $fromMonth + 1;
        $nextYear = $fromMonth === 12 ? $fromYear + 1 : $fromYear;

        $newBudgets = collect();

        foreach ($existingBudgets as $budget) {
            $newBudget = $user->budgets()->firstOrCreate(
                [
                    'category_id' => $budget->category_id,
                    'month' => $nextMonth,
                    'year' => $nextYear,
                ],
                [
                    'amount' => $budget->amount,
                ]
            );
            $newBudgets->push($newBudget);
        }

        return $newBudgets;
    }
}