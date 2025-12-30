<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class DefaultCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $expenseCategories = [
            ['name' => 'Food & Dining', 'icon' => '🍽️', 'color' => 'bg-orange-500'],
            ['name' => 'Transportation', 'icon' => '🚗', 'color' => 'bg-blue-500'],
            ['name' => 'Entertainment', 'icon' => '🎬', 'color' => 'bg-purple-500'],
            ['name' => 'Utilities', 'icon' => '💡', 'color' => 'bg-yellow-500'],
            ['name' => 'Shopping', 'icon' => '🛒', 'color' => 'bg-pink-500'],
            ['name' => 'Healthcare', 'icon' => '🏥', 'color' => 'bg-red-500'],
            ['name' => 'Education', 'icon' => '📚', 'color' => 'bg-indigo-500'],
            ['name' => 'Personal Care', 'icon' => '💅', 'color' => 'bg-rose-500'],
            ['name' => 'Housing', 'icon' => '🏠', 'color' => 'bg-teal-500'],
            ['name' => 'Insurance', 'icon' => '🛡️', 'color' => 'bg-slate-500'],
            ['name' => 'Subscriptions', 'icon' => '📱', 'color' => 'bg-cyan-500'],
            ['name' => 'Other', 'icon' => '📦', 'color' => 'bg-gray-500'],
        ];

        $incomeCategories = [
            ['name' => 'Salary', 'icon' => '💰', 'color' => 'bg-green-500'],
            ['name' => 'Freelance', 'icon' => '💻', 'color' => 'bg-cyan-500'],
            ['name' => 'Business', 'icon' => '🏢', 'color' => 'bg-blue-500'],
            ['name' => 'Investments', 'icon' => '📈', 'color' => 'bg-emerald-500'],
            ['name' => 'Gifts', 'icon' => '🎁', 'color' => 'bg-pink-500'],
            ['name' => 'Refunds', 'icon' => '↩️', 'color' => 'bg-amber-500'],
            ['name' => 'Other Income', 'icon' => '💵', 'color' => 'bg-gray-500'],
        ];

        // Create for all users, or you can call this when a user registers
        User::all()->each(function ($user) use ($expenseCategories, $incomeCategories) {
            foreach ($expenseCategories as $category) {
                Category::firstOrCreate(
                    ['user_id' => $user->id, 'name' => $category['name'], 'type' => 'expense'],
                    ['icon' => $category['icon'], 'color' => $category['color']]
                );
            }

            foreach ($incomeCategories as $category) {
                Category::firstOrCreate(
                    ['user_id' => $user->id, 'name' => $category['name'], 'type' => 'income'],
                    ['icon' => $category['icon'], 'color' => $category['color']]
                );
            }
        });
    }

    // Call this method when a new user registers
    public static function createForUser(User $user): void
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

        // Create default user settings
        $user->settings()->create([
            'monthly_savings_goal' => 10000,
            'currency' => 'PHP',
            'locale' => 'en-PH',
        ]);
    }
}