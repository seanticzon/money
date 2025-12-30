<?php

namespace App\Services;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AccountService
{
    public function getAllForUser(User $user): Collection
    {
        return $user->accounts()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function getById(User $user, int $id): ?Account
    {
        return $user->accounts()->find($id);
    }

    public function create(User $user, array $data): Account
    {
        return $user->accounts()->create([
            'name' => $data['name'],
            'type' => $data['type'],
            'balance' => $data['balance'] ?? 0,
            'icon' => $data['icon'] ?? null,
            'color' => $data['color'] ?? 'bg-blue-500',
            'is_active' => true,
        ]);
    }

    public function update(Account $account, array $data): Account
    {
        $account->update([
            'name' => $data['name'] ?? $account->name,
            'type' => $data['type'] ?? $account->type,
            'icon' => $data['icon'] ?? $account->icon,
            'color' => $data['color'] ?? $account->color,
        ]);

        return $account->fresh();
    }

    public function delete(Account $account): bool
    {
        // Soft delete by marking inactive
        return $account->update(['is_active' => false]);
    }

    public function forceDelete(Account $account): bool
    {
        return $account->delete();
    }

    public function adjustBalance(Account $account, float $amount): Account
    {
        $account->increment('balance', $amount);
        return $account->fresh();
    }

    public function recalculateBalance(Account $account): Account
    {
        $account->recalculateBalance();
        return $account->fresh();
    }

    public function getTotalBalance(User $user): float
    {
        return $user->accounts()
            ->where('is_active', true)
            ->sum('balance');
    }

    public function getTotalAssets(User $user): float
    {
        return $user->accounts()
            ->where('is_active', true)
            ->where('balance', '>', 0)
            ->sum('balance');
    }

    public function getTotalLiabilities(User $user): float
    {
        return abs($user->accounts()
            ->where('is_active', true)
            ->where('balance', '<', 0)
            ->sum('balance'));
    }

    public function getNetWorth(User $user): float
    {
        return $this->getTotalAssets($user) - $this->getTotalLiabilities($user);
    }

    public function getAccountsSummary(User $user): array
    {
        $accounts = $this->getAllForUser($user);
        
        return [
            'accounts' => $accounts,
            'total_assets' => $this->getTotalAssets($user),
            'total_liabilities' => $this->getTotalLiabilities($user),
            'net_worth' => $this->getNetWorth($user),
        ];
    }
}