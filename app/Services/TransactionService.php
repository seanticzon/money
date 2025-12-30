<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function __construct(
        protected AccountService $accountService
    ) {}

    public function getAllForUser(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = $user->transactions()
            ->with(['account', 'category', 'toAccount'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['account_id'])) {
            $query->where('account_id', $filters['account_id']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['month']) && !empty($filters['year'])) {
            $query->forMonth($filters['month'], $filters['year']);
        }

        if (!empty($filters['search'])) {
            $query->where('description', 'like', '%' . $filters['search'] . '%');
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getRecent(User $user, int $limit = 10): Collection
    {
        return $user->transactions()
            ->with(['account', 'category'])
            ->recent($limit)
            ->get();
    }

    public function getById(User $user, int $id): ?Transaction
    {
        return $user->transactions()
            ->with(['account', 'category', 'toAccount'])
            ->find($id);
    }

    public function createIncome(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data) {
            $transaction = $user->transactions()->create([
                'account_id' => $data['account_id'],
                'category_id' => $data['category_id'],
                'type' => 'income',
                'amount' => $data['amount'],
                'description' => $data['description'],
                'notes' => $data['notes'] ?? null,
                'transaction_date' => $data['transaction_date'],
            ]);

            // Update account balance
            $account = Account::find($data['account_id']);
            $this->accountService->adjustBalance($account, $data['amount']);

            return $transaction->load(['account', 'category']);
        });
    }

    public function createExpense(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data) {
            $transaction = $user->transactions()->create([
                'account_id' => $data['account_id'],
                'category_id' => $data['category_id'],
                'type' => 'expense',
                'amount' => $data['amount'],
                'description' => $data['description'],
                'notes' => $data['notes'] ?? null,
                'transaction_date' => $data['transaction_date'],
            ]);

            // Update account balance (subtract)
            $account = Account::find($data['account_id']);
            $this->accountService->adjustBalance($account, -$data['amount']);

            return $transaction->load(['account', 'category']);
        });
    }

    public function createTransfer(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data) {
            $transaction = $user->transactions()->create([
                'account_id' => $data['from_account_id'],
                'to_account_id' => $data['to_account_id'],
                'type' => 'transfer',
                'amount' => $data['amount'],
                'description' => $data['description'] ?? 'Transfer',
                'notes' => $data['notes'] ?? null,
                'transaction_date' => $data['transaction_date'],
            ]);

            // Update both account balances
            $fromAccount = Account::find($data['from_account_id']);
            $toAccount = Account::find($data['to_account_id']);
            
            $this->accountService->adjustBalance($fromAccount, -$data['amount']);
            $this->accountService->adjustBalance($toAccount, $data['amount']);

            return $transaction->load(['account', 'toAccount']);
        });
    }

    public function update(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            $oldAmount = $transaction->amount;
            $oldAccountId = $transaction->account_id;
            $oldToAccountId = $transaction->to_account_id;

            // Reverse old transaction effect
            $this->reverseTransactionEffect($transaction);

            // Update transaction
            $transaction->update([
                'account_id' => $data['account_id'] ?? $transaction->account_id,
                'category_id' => $data['category_id'] ?? $transaction->category_id,
                'to_account_id' => $data['to_account_id'] ?? $transaction->to_account_id,
                'amount' => $data['amount'] ?? $transaction->amount,
                'description' => $data['description'] ?? $transaction->description,
                'notes' => $data['notes'] ?? $transaction->notes,
                'transaction_date' => $data['transaction_date'] ?? $transaction->transaction_date,
            ]);

            // Apply new transaction effect
            $this->applyTransactionEffect($transaction->fresh());

            return $transaction->fresh()->load(['account', 'category', 'toAccount']);
        });
    }

    public function delete(Transaction $transaction): bool
    {
        return DB::transaction(function () use ($transaction) {
            $this->reverseTransactionEffect($transaction);
            return $transaction->delete();
        });
    }

    protected function reverseTransactionEffect(Transaction $transaction): void
    {
        $account = $transaction->account;

        switch ($transaction->type) {
            case 'income':
                $this->accountService->adjustBalance($account, -$transaction->amount);
                break;
            case 'expense':
                $this->accountService->adjustBalance($account, $transaction->amount);
                break;
            case 'transfer':
                $this->accountService->adjustBalance($account, $transaction->amount);
                if ($transaction->toAccount) {
                    $this->accountService->adjustBalance($transaction->toAccount, -$transaction->amount);
                }
                break;
        }
    }

    protected function applyTransactionEffect(Transaction $transaction): void
    {
        $account = $transaction->account;

        switch ($transaction->type) {
            case 'income':
                $this->accountService->adjustBalance($account, $transaction->amount);
                break;
            case 'expense':
                $this->accountService->adjustBalance($account, -$transaction->amount);
                break;
            case 'transfer':
                $this->accountService->adjustBalance($account, -$transaction->amount);
                if ($transaction->toAccount) {
                    $this->accountService->adjustBalance($transaction->toAccount, $transaction->amount);
                }
                break;
        }
    }

    public function getMonthlyIncome(User $user, int $month, int $year): float
    {
        return $user->transactions()
            ->income()
            ->forMonth($month, $year)
            ->sum('amount');
    }

    public function getMonthlyExpenses(User $user, int $month, int $year): float
    {
        return $user->transactions()
            ->expenses()
            ->forMonth($month, $year)
            ->sum('amount');
    }

    public function getMonthlySummary(User $user, int $month, int $year): array
    {
        $income = $this->getMonthlyIncome($user, $month, $year);
        $expenses = $this->getMonthlyExpenses($user, $month, $year);

        return [
            'income' => $income,
            'expenses' => $expenses,
            'net' => $income - $expenses,
        ];
    }
}