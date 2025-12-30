<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['type', 'account_id', 'category_id', 'month', 'year', 'search', 'per_page']);
        $transactions = $this->transactionService->getAllForUser($request->user(), $filters);
        
        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'account_id' => 'required_unless:type,transfer|exists:accounts,id',
            'from_account_id' => 'required_if:type,transfer|exists:accounts,id',
            'to_account_id' => 'required_if:type,transfer|exists:accounts,id|different:from_account_id',
            'category_id' => 'required_unless:type,transfer|exists:categories,id',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $transaction = match ($validated['type']) {
            'income' => $this->transactionService->createIncome($user, $validated),
            'expense' => $this->transactionService->createExpense($user, $validated),
            'transfer' => $this->transactionService->createTransfer($user, $validated),
        };

        return response()->json($transaction, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $transaction = $this->transactionService->getById($request->user(), $id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json($transaction);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $transaction = $this->transactionService->getById($request->user(), $id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'description' => 'sometimes|string|max:255',
            'account_id' => 'sometimes|exists:accounts,id',
            'to_account_id' => 'sometimes|exists:accounts,id',
            'category_id' => 'sometimes|exists:categories,id',
            'transaction_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $transaction = $this->transactionService->update($transaction, $validated);

        return response()->json($transaction);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $transaction = $this->transactionService->getById($request->user(), $id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $this->transactionService->delete($transaction);

        return response()->json(['message' => 'Transaction deleted']);
    }

    public function summary(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $summary = $this->transactionService->getMonthlySummary($request->user(), $month, $year);

        return response()->json($summary);
    }
}