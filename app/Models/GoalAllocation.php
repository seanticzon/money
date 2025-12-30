<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoalAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'user_id',
        'account_id',
        'amount',
        'notes',
        'allocation_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'allocation_date' => 'date',
    ];

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function getIsDepositAttribute(): bool
    {
        return $this->amount > 0;
    }

    public function getIsWithdrawalAttribute(): bool
    {
        return $this->amount < 0;
    }
}