<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $type = $request->input('type');

        $categories = $type
            ? $this->categoryService->getByType($request->user(), $type)
            : $this->categoryService->getAllForUser($request->user());

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
        ]);

        $category = $this->categoryService->create($request->user(), $validated);

        return response()->json($category, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $category = $this->categoryService->getById($request->user(), $id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json($category);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = $this->categoryService->getById($request->user(), $id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
        ]);

        $category = $this->categoryService->update($category, $validated);

        return response()->json($category);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = $this->categoryService->getById($request->user(), $id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $this->categoryService->delete($category);

        return response()->json(['message' => 'Category deleted']);
    }

    public function spending(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $spending = $this->categoryService->getCategorySpending($request->user(), $month, $year);

        return response()->json($spending);
    }
}