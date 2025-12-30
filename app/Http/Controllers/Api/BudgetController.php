<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(
        protected BudgetService $budgetService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $data = $this->budgetService->getBudgetSummary($request->user(), $month, $year);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2020|max:2100',
        ]);

        $budget = $this->budgetService->create($request->user(), $validated);

        return response()->json($budget->load('category'), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $budget = $this->budgetService->getById($request->user(), $id);

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        return response()->json([
            'budget' => $budget,
            'spent' => $budget->spent,
            'remaining' => $budget->remaining,
            'progress' => $budget->progress,
            'is_over_budget' => $budget->is_over_budget,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $budget = $this->budgetService->getById($request->user(), $id);

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $budget = $this->budgetService->update($budget, $validated);

        return response()->json($budget);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $budget = $this->budgetService->getById($request->user(), $id);

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $this->budgetService->delete($budget);

        return response()->json(['message' => 'Budget deleted']);
    }

    public function copyToNextMonth(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $newBudgets = $this->budgetService->copyBudgetsToNextMonth($request->user(), $month, $year);

        return response()->json([
            'message' => 'Budgets copied to next month',
            'budgets' => $newBudgets->load('category'),
        ]);
    }
}