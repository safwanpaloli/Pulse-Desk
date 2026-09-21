<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
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
        $user = $request->user();
        $query = Ticket::with('user');

        // Normal users only see their own tickets
        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }

        // Search by subject
        if ($search = $request->input('search')) {
            $query->where('subject', 'like', "%{$search}%");
        }

        // Filter by status
        if ($status = $request->input('status')) {
            if (in_array($status, ['open', 'in_progress', 'resolved', 'closed'])) {
                $query->where('status', $status);
            }
        }
        
        // Filter by priority
        if ($priority = $request->input('priority')) {
            if (in_array($priority, ['low', 'medium', 'high'])) {
                $query->where('priority', $priority);
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['subject', 'status', 'priority', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } elseif ($sortBy === 'user_name') {
            // Sort by relationship column
            $query->orderBy(
                \App\Models\User::select('name')->whereColumn('users.id', 'tickets.user_id'),
                $sortDir === 'asc' ? 'asc' : 'desc'
            );
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticket = Ticket::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);
        
        $ticket->load('user');

        return response()->json(['message' => 'Ticket created successfully', 'ticket' => $ticket], 201);
    }

    public function show(Request $request, $id)
    {
        $ticket = Ticket::with(['user', 'replies.user'])->findOrFail($id);
        
        // Ensure user can only view their own ticket unless they are admin/manager
        $user = $request->user();
        if ($user->role === 'user' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json($ticket);
    }

    public function updateStatus(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        // Only admin/manager can update status/priority directly from list
        $user = $request->user();
        if ($user->role === 'user') {
             // User can only close their own ticket
             if ($ticket->user_id !== $user->id) {
                 return response()->json(['message' => 'Unauthorized'], 403);
             }
             $validated = $request->validate(['status' => 'required|in:closed']);
             $ticket->update(['status' => 'closed']);
             return response()->json(['message' => 'Ticket closed successfully', 'ticket' => $ticket]);
        }
        
        $validated = $request->validate([
            'status' => 'sometimes|required|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|required|in:low,medium,high',
        ]);

        $ticket->update($validated);
        
        $ticket->load('user');

        return response()->json(['message' => 'Ticket updated successfully', 'ticket' => $ticket]);
    }
    
    public function reply(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        $user = $request->user();
        
        if ($user->role === 'user' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'message' => 'required|string',
        ]);
        
        $reply = \App\Models\TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
        ]);
        
        // If an admin replies, maybe change status to in_progress if it was open
        if ($user->role !== 'user' && $ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }
        
        // If user replies, maybe change status back to open if it was resolved
        if ($user->role === 'user' && $ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }
        
        $reply->load('user');
        
        return response()->json(['message' => 'Reply added successfully', 'reply' => $reply]);
    }
}
