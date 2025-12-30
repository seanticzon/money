<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_id',
        'name',
        'icon',
        'color',
        'target_amount',
        'current_amount',
        'deadline',
        'monthly_target',
        'is_completed',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'monthly_target' => 'decimal:2',
        'deadline' => 'date',
        'is_completed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(GoalAllocation::class);
    }

    // Get progress percentage
    public function getProgressAttribute(): float
    {
        if ($this->target_amount == 0) return 0;
        return min(($this->current_amount / $this->target_amount) * 100, 100);
    }

    // Get remaining amount
    public function getRemainingAttribute(): float
    {
        return max($this->target_amount - $this->current_amount, 0);
    }

    // Get days remaining until deadline
    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->deadline) return null;
        return max(now()->diffInDays($this->deadline, false), 0);
    }

    // Add funds to goal
    public function addFunds(float $amount, ?int $accountId = null, ?string $notes = null): GoalAllocation
    {
        $allocation = $this->allocations()->create([
            'user_id' => $this->user_id,
            'account_id' => $accountId ?? $this->account_id,
            'amount' => $amount,
            'notes' => $notes,
            'allocation_date' => now(),
        ]);

        $this->increment('current_amount', $amount);

        // Check if goal is completed
        if ($this->current_amount >= $this->target_amount) {
            $this->update(['is_completed' => true]);
        }

        return $allocation;
    }

    // Scope for active goals
    public function scopeActive($query)
    {
        return $query->where('is_completed', false);
    }
}