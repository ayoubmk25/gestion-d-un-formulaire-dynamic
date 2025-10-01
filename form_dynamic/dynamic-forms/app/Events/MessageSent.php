<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Discussion;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The discussion model instance.
     *
     * @var \App\Models\Discussion
     */
    public $discussion;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Discussion $discussion
     */
    public function __construct(Discussion $discussion)
    {
        // Ensure relations are loaded before broadcasting
        $this->discussion = $discussion;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel[]
     */
    public function broadcastOn(): array
    {
        // Use the discussion ID for the private channel
        return [
            new PrivateChannel('private-discussion.' . $this->discussion->id),
        ];
    }

    /**
     * The name of the broadcasting connection to use.
     *
     * @return string|null
     */
    public function broadcastConnection(): string|null
    {
        return 'reverb';
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * The data to broadcast with the event.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->discussion->id,
            'sender_id' => $this->discussion->sender_id,
            'recipient_id' => $this->discussion->recipient_id,
            'content' => $this->discussion->content,
            'created_at' => $this->discussion->created_at->toDateTimeString(),
            'sender' => [
                'id' => $this->discussion->sender->id,
                'name' => $this->discussion->sender->name,
            ],
            'recipient' => $this->discussion->recipient ? [
                'id' => $this->discussion->recipient->id,
                'name' => $this->discussion->recipient->name,
            ] : null,
        ];
    }
}
