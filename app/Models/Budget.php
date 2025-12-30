<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'amount',
        'month',
        'year',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Get spent amount for this budget
    public function getSpentAttribute(): float
    {
        return $this->category->getSpentAmount($this->month, $this->year);
    }

    // Get remaining amount
    public function getRemainingAttribute(): float
    {
        return $this->amount - $this->spent;
    }

    // Get progress percentage
    public function getProgressAttribute(): float
    {
        if ($this->amount == 0) return 0;
        return min(($this->spent / $this->amount) * 100, 100);
    }

    // Check if over budget
    public function getIsOverBudgetAttribute(): bool
    {
        return $this->spent > $this->amount;
    }

    // Scope for current month
    public function scopeCurrentMonth($query)
    {
        return $query->where('month', now()->month)
                     ->where('year', now()->year);
    }
}