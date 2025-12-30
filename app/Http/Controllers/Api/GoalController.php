<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GoalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(
        protected GoalService $goalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $includeCompleted = $request->boolean('include_completed', false);
        $data = $this->goalService->getGoalsSummary($request->user());

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date|after:today',
            'monthly_target' => 'nullable|numeric|min:0',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $goal = $this->goalService->create($request->user(), $validated);

        return response()->json($goal, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $goal = $this->goalService->getById($request->user(), $id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        return response()->json([
            'goal' => $goal,
            'progress' => $goal->progress,
            'remaining' => $goal->remaining,
            'days_remaining' => $goal->days_remaining,
            'allocations' => $this->goalService->getAllocations($goal),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $goal = $this->goalService->getById($request->user(), $id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:0.01',
            'deadline' => 'nullable|date',
            'monthly_target' => 'nullable|numeric|min:0',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $goal = $this->goalService->update($goal, $validated);

        return response()->json($goal);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $goal = $this->goalService->getById($request->user(), $id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        $this->goalService->delete($goal);

        return response()->json(['message' => 'Goal deleted']);
    }

    public function addFunds(Request $request, int $id): JsonResponse
    {
        $goal = $this->goalService->getById($request->user(), $id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'account_id' => 'nullable|exists:accounts,id',
            'notes' => 'nullable|string|max:255',
            'allocation_date' => 'nullable|date',
        ]);

        $allocation = $this->goalService->addFunds($goal, $validated);

        return response()->json([
            'message' => 'Funds added successfully',
            'allocation' => $allocation,
            'goal' => $goal->fresh(),
        ]);
    }

    public function withdrawFunds(Request $request, int $id): JsonResponse
    {
        $goal = $this->goalService->getById($request->user(), $id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $goal->current_amount,
            'account_id' => 'nullable|exists:accounts,id',
            'notes' => 'nullable|string|max:255',
            'allocation_date' => 'nullable|date',
        ]);

        $allocation = $this->goalService->withdrawFunds($goal, $validated);

        return response()->json([
            'message' => 'Funds withdrawn successfully',
            'allocation' => $allocation,
            'goal' => $goal->fresh(),
        ]);
    }
}