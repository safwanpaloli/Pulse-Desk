<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{

    public function index(Request $request)
    {
        $query = Subscription::with('user');

        // Search by user name or email
        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            if (in_array($status, ['active', 'canceled', 'past_due'])) {
                $query->where('status', $status);
            }
        }
        
        // Filter by plan
        if ($plan = $request->input('plan')) {
            if (in_array($plan, ['Basic', 'Pro', 'Enterprise'])) {
                $query->where('plan_name', $plan);
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['plan_name', 'price', 'status', 'starts_at', 'ends_at', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } elseif ($sortBy === 'user_name') {
            // Sort by relationship column (simpler approach for pagination)
            $query->orderBy(
                \App\Models\User::select('name')->whereColumn('users.id', 'subscriptions.user_id'),
                $sortDir === 'asc' ? 'asc' : 'desc'
            );
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_name' => 'required|string|in:Basic,Pro,Enterprise',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,canceled,past_due',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $subscription = Subscription::create($validated);
        $subscription->load('user');

        return response()->json(['message' => 'Subscription created successfully', 'subscription' => $subscription], 201);
    }

    public function update(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'plan_name' => 'required|string|in:Basic,Pro,Enterprise',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,canceled,past_due',
            'ends_at' => 'nullable|date',
        ]);

        $subscription->update($validated);
        $subscription->load('user');

        return response()->json(['message' => 'Subscription updated successfully', 'subscription' => $subscription]);
    }

    public function cancel($id)
    {
        $subscription = Subscription::findOrFail($id);
        
        $subscription->update([
            'status' => 'canceled',
            'ends_at' => now(),
        ]);
        
        $subscription->load('user');

        return response()->json(['message' => 'Subscription canceled successfully', 'subscription' => $subscription]);
    }
}
