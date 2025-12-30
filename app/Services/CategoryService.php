<?php

namespace App\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function getAllForUser(User $user): Collection
    {
        return $user->categories()
            ->where('is_active', true)
            ->orderBy('type')
            ->orderBy('name')
            ->get();
    }

    public function getByType(User $user, string $type): Collection
    {
        return $user->categories()
            ->where('type', $type)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function getExpenseCategories(User $user): Collection
    {
        return $this->getByType($user, 'expense');
    }

    public function getIncomeCategories(User $user): Collection
    {
        return $this->getByType($user, 'income');
    }

    public function getById(User $user, int $id): ?Category
    {
        return $user->categories()->find($id);
    }

    public function create(User $user, array $data): Category
    {
        return $user->categories()->create([
            'name' => $data['name'],
            'type' => $data['type'],
            'icon' => $data['icon'] ?? '📦',
            'color' => $data['color'] ?? 'bg-gray-500',
            'is_active' => true,
        ]);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update([
            'name' => $data['name'] ?? $category->name,
            'icon' => $data['icon'] ?? $category->icon,
            'color' => $data['color'] ?? $category->color,
        ]);

        return $category->fresh();
    }

    public function delete(Category $category): bool
    {
        return $category->update(['is_active' => false]);
    }

    public function getCategorySpending(User $user, int $month, int $year): Collection
    {
        return $user->categories()
            ->where('type', 'expense')
            ->where('is_active', true)
            ->withSum(['transactions' => function ($query) use ($month, $year) {
                $query->where('type', 'expense')
                    ->whereMonth('transaction_date', $month)
                    ->whereYear('transaction_date', $year);
            }], 'amount')
            ->withCount(['transactions' => function ($query) use ($month, $year) {
                $query->where('type', 'expense')
                    ->whereMonth('transaction_date', $month)
                    ->whereYear('transaction_date', $year);
            }])
            ->get();
    }

    public function createDefaultCategories(User $user): void
    {
        $expenseCategories = [
            ['name' => 'Food & Dining', 'icon' => '🍽️', 'color' => 'bg-orange-500'],
            ['name' => 'Transportation', 'icon' => '🚗', 'color' => 'bg-blue-500'],
            ['name' => 'Entertainment', 'icon' => '🎬', 'color' => 'bg-purple-500'],
            ['name' => 'Utilities', 'icon' => '💡', 'color' => 'bg-yellow-500'],
            ['name' => 'Shopping', 'icon' => '🛒', 'color' => 'bg-pink-500'],
            ['name' => 'Healthcare', 'icon' => '🏥', 'color' => 'bg-red-500'],
            ['name' => 'Other', 'icon' => '📦', 'color' => 'bg-gray-500'],
        ];

        $incomeCategories = [
            ['name' => 'Salary', 'icon' => '💰', 'color' => 'bg-green-500'],
            ['name' => 'Freelance', 'icon' => '💻', 'color' => 'bg-cyan-500'],
            ['name' => 'Other Income', 'icon' => '💵', 'color' => 'bg-gray-500'],
        ];

        foreach ($expenseCategories as $category) {
            $user->categories()->create([...$category, 'type' => 'expense']);
        }

        foreach ($incomeCategories as $category) {
            $user->categories()->create([...$category, 'type' => 'income']);
        }
    }
}