<?php

namespace App\Http\Controllers;

use App\Models\Discussion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DiscussionController extends Controller
{
    /**
     * Fetch all discussions.
     */
    public function index()
    {
        $discussions = Discussion::with(['sender', 'recipient'])->get();
        return response()->json($discussions);
    }

    /**
     * Store a new discussion message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'recipient_id' => 'nullable|exists:users,id',
            'content' => 'required|string',
        ]);

        Log::info('Creating discussion with data:', $request->all());

        $discussion = Discussion::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'content' => $request->content,
        ]);

        Log::info('Discussion created:', $discussion->toArray());
        Log::info('Broadcasting MessageSent event for discussion ID:', ['id' => $discussion->id]);

        broadcast(new \App\Events\MessageSent($discussion->load(['sender', 'recipient'])));

        return response()->json($discussion->load(['sender', 'recipient']), 201);
    }

    /**
     * Fetch discussions for the authenticated user.
     */
    public function userDiscussions()
    {
        $userId = Auth::id();
        \Log::info('Fetching discussions for user ID: ' . $userId);

        $query = Discussion::where('sender_id', $userId)
                                 ->orWhere('recipient_id', $userId)
                                 ->with(['sender', 'recipient']);

        \Log::info('Discussion query: ' . $query->toSql());
        \Log::info('Discussion query bindings: ' . json_encode($query->getBindings()));

        $discussions = $query->get();

        \Log::info('Discussions fetched: ' . $discussions->toJson());

        return response()->json($discussions);
    }

    /**
     * Fetch messages for a specific discussion.
     */
    public function showMessages($discussionId)
    {
        $discussion = Discussion::with(['sender', 'recipient'])
                                ->findOrFail($discussionId);

        // Ensure the authenticated user is part of the discussion
        if ($discussion->sender_id !== Auth::id() && $discussion->recipient_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($discussion);
    }

    /**
     * Mark messages in a discussion as read for the authenticated user.
     */
    public function markAsRead($discussionId)
    {
        $userId = Auth::id();
        Discussion::where('id', $discussionId)
                  ->where(function ($query) use ($userId) {
                      $query->where('sender_id', $userId)
                            ->orWhere('recipient_id', $userId);
                  })
                  ->update(['read_at' => now()]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}
