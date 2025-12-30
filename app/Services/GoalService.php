<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\GoalAllocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class GoalService
{
    public function getAllForUser(User $user, bool $includeCompleted = false): Collection
    {
        $query = $user->goals()
            ->with('account')
            ->orderBy('deadline');

        if (!$includeCompleted) {
            $query->active();
        }

        return $query->get();
    }

    public function getById(User $user, int $id): ?Goal
    {
        return $user->goals()->with(['account', 'allocations'])->find($id);
    }

    public function create(User $user, array $data): Goal
    {
        $goal = $user->goals()->create([
            'name' => $data['name'],
            'icon' => $data['icon'] ?? '🎯',
            'color' => $data['color'] ?? 'bg-blue-500',
            'target_amount' => $data['target_amount'],
            'current_amount' => $data['current_amount'] ?? 0,
            'deadline' => $data['deadline'] ?? null,
            'monthly_target' => $data['monthly_target'] ?? null,
            'account_id' => $data['account_id'] ?? null,
            'is_completed' => false,
        ]);

        // Auto-calculate monthly target if deadline is set
        if ($goal->deadline && !$goal->monthly_target) {
            $monthsRemaining = max(now()->diffInMonths($goal->deadline), 1);
            $goal->update([
                'monthly_target' => ($goal->target_amount - $goal->current_amount) / $monthsRemaining
            ]);
        }

        return $goal->fresh();
    }

    public function update(Goal $goal, array $data): Goal
    {
        $goal->update([
            'name' => $data['name'] ?? $goal->name,
            'icon' => $data['icon'] ?? $goal->icon,
            'color' => $data['color'] ?? $goal->color,
            'target_amount' => $data['target_amount'] ?? $goal->target_amount,
            'deadline' => $data['deadline'] ?? $goal->deadline,
            'monthly_target' => $data['monthly_target'] ?? $goal->monthly_target,
            'account_id' => $data['account_id'] ?? $goal->account_id,
        ]);

        return $goal->fresh();
    }

    public function delete(Goal $goal): bool
    {
        return $goal->delete();
    }

    public function addFunds(Goal $goal, array $data): GoalAllocation
    {
        return DB::transaction(function () use ($goal, $data) {
            $allocation = $goal->allocations()->create([
                'user_id' => $goal->user_id,
                'account_id' => $data['account_id'] ?? $goal->account_id,
                'amount' => $data['amount'],
                'notes' => $data['notes'] ?? null,
                'allocation_date' => $data['allocation_date'] ?? now(),
            ]);

            $goal->increment('current_amount', $data['amount']);

            // Check if goal is completed
            if ($goal->fresh()->current_amount >= $goal->target_amount) {
                $goal->update(['is_completed' => true]);
            }

            return $allocation;
        });
    }

    public function withdrawFunds(Goal $goal, array $data): GoalAllocation
    {
        return DB::transaction(function () use ($goal, $data) {
            $allocation = $goal->allocations()->create([
                'user_id' => $goal->user_id,
                'account_id' => $data['account_id'] ?? $goal->account_id,
                'amount' => -$data['amount'], // Negative for withdrawal
                'notes' => $data['notes'] ?? 'Withdrawal',
                'allocation_date' => $data['allocation_date'] ?? now(),
            ]);

            $goal->decrement('current_amount', $data['amount']);

            // Mark as incomplete if below target
            if ($goal->fresh()->current_amount < $goal->target_amount) {
                $goal->update(['is_completed' => false]);
            }

            return $allocation;
        });
    }

    public function getAllocations(Goal $goal): Collection
    {
        return $goal->allocations()
            ->with('account')
            ->orderBy('allocation_date', 'desc')
            ->get();
    }

    public function getGoalsSummary(User $user): array
    {
        $goals = $this->getAllForUser($user);

        $totalTarget = $goals->sum('target_amount');
        $totalSaved = $goals->sum('current_amount');

        return [
            'goals' => $goals->map(function ($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'icon' => $goal->icon,
                    'color' => $goal->color,
                    'target_amount' => (float) $goal->target_amount,
                    'current_amount' => (float) $goal->current_amount,
                    'remaining' => (float) $goal->remaining,
                    'progress' => round($goal->progress, 1),
                    'deadline' => $goal->deadline?->format('Y-m-d'),
                    'days_remaining' => $goal->days_remaining,
                    'monthly_target' => (float) $goal->monthly_target,
                    'is_completed' => $goal->is_completed,
                ];
            }),
            'total_target' => $totalTarget,
            'total_saved' => $totalSaved,
            'overall_progress' => $totalTarget > 0 ? round(($totalSaved / $totalTarget) * 100, 1) : 0,
        ];
    }

    public function getTopGoals(User $user, int $limit = 3): Collection
    {
        return $user->goals()
            ->active()
            ->orderBy('deadline')
            ->limit($limit)
            ->get();
    }
}