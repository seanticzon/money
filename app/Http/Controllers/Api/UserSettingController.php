<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSettingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $settings = $user->settings;

        // Create default settings if none exist
        if (!$settings) {
            $settings = $user->settings()->create([
                'monthly_savings_goal' => 0,
                'currency' => 'PHP',
                'locale' => 'en-PH',
            ]);
        }

        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'monthly_savings_goal' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'locale' => 'sometimes|string|max:10',
        ]);

        $user = $request->user();
        $settings = $user->settings;

        if (!$settings) {
            $settings = $user->settings()->create([
                'monthly_savings_goal' => $validated['monthly_savings_goal'] ?? 0,
                'currency' => $validated['currency'] ?? 'PHP',
                'locale' => $validated['locale'] ?? 'en-PH',
            ]);
        } else {
            $settings->update($validated);
        }

        return response()->json($settings->fresh());
    }
}