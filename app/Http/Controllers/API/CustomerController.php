<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'user');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            if (in_array($status, ['active', 'inactive'])) {
                $query->where('status', $status);
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['name', 'email', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'status' => 'required|in:active,inactive',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'user',
            'status' => $validated['status'],
        ]);

        return response()->json(['message' => 'Customer created successfully', 'customer' => $user], 201);
    }

    public function show($id)
    {
        $customer = User::where('role', 'user')->findOrFail($id);
        return response()->json($customer);
    }

    public function update(Request $request, $id)
    {
        $customer = User::where('role', 'user')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$customer->id,
            'status' => 'required|in:active,inactive',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $customer->name = $validated['name'];
        $customer->email = $validated['email'];
        $customer->status = $validated['status'];
        
        if (!empty($validated['password'])) {
            $customer->password = bcrypt($validated['password']);
        }

        $customer->save();

        return response()->json(['message' => 'Customer updated successfully', 'customer' => $customer]);
    }

    public function updateStatus(Request $request, $id)
    {
        $customer = User::where('role', 'user')->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $customer->status = $validated['status'];
        $customer->save();

        return response()->json(['message' => 'Customer status updated successfully', 'customer' => $customer]);
    }
}
