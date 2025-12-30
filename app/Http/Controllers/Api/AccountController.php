<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        protected AccountService $accountService
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('accounts/index', [
            'data' => $this->accountService->getAccountsSummary($request->user()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank,ewallet,cash,credit_card',
            'balance' => 'nullable|numeric',
            'color' => 'nullable|string|max:50',
        ]);

        $this->accountService->create($request->user(), $validated);

        return back()->with('success', 'Account created successfully.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $account = $this->accountService->getById($request->user(), $id);

        if (!$account) {
            return back()->withErrors(['error' => 'Account not found.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank,ewallet,cash,credit_card',
            'color' => 'nullable|string|max:50',
        ]);

        $this->accountService->update($account, $validated);

        return back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $account = $this->accountService->getById($request->user(), $id);

        if (!$account) {
            return back()->withErrors(['error' => 'Account not found.']);
        }

        $this->accountService->delete($account);

        return back()->with('success', 'Account deleted successfully.');
    }
}