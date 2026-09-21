<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function index(Request $request)
    {
        $query = Invoice::with('user');

        // Search by user name, email, or invoice number
        if ($search = $request->input('search')) {
            $query->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            if (in_array($status, ['pending', 'paid', 'overdue', 'canceled'])) {
                $query->where('status', $status);
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['invoice_number', 'amount', 'status', 'due_date', 'paid_at', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } elseif ($sortBy === 'user_name') {
            // Sort by relationship column
            $query->orderBy(
                \App\Models\User::select('name')->whereColumn('users.id', 'invoices.user_id'),
                $sortDir === 'asc' ? 'asc' : 'desc'
            );
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,overdue,canceled',
            'due_date' => 'required|date',
            'paid_at' => 'nullable|date',
        ]);

        $validated['invoice_number'] = 'INV-' . strtoupper(substr(uniqid(), -5)) . rand(10, 99);

        $invoice = Invoice::create($validated);
        $invoice->load('user');

        return response()->json(['message' => 'Invoice created successfully', 'invoice' => $invoice], 201);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,overdue,canceled',
            'due_date' => 'required|date',
            'paid_at' => 'nullable|date',
        ]);

        $invoice->update($validated);
        $invoice->load('user');

        return response()->json(['message' => 'Invoice updated successfully', 'invoice' => $invoice]);
    }

    public function updateStatus(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,overdue,canceled',
        ]);

        $invoice->status = $validated['status'];
        if ($invoice->status === 'paid' && !$invoice->paid_at) {
            $invoice->paid_at = now();
        }
        $invoice->save();
        
        $invoice->load('user');

        return response()->json(['message' => 'Invoice status updated successfully', 'invoice' => $invoice]);
    }
}
