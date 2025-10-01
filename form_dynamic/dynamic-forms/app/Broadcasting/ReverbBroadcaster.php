<?php

namespace App\Broadcasting;

use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Illuminate\Contracts\Auth\Authenticatable;

class ReverbBroadcaster extends Broadcaster
{
    /**
     * Authenticate the incoming request for a given channel.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
     */
    public function auth($request)
    {
        $channelName = $this->normalizeChannelName($request->channel_name);

        if ($this->guards()->check()) {
            return $this->verifyUserCanAccessChannel(
                $request, $channelName
            );
        }

        throw new AccessDeniedHttpException;
    }

    /**
     * Return the valid authentication response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $result
     * @return mixed
     */
    public function validAuthenticationResponse($request, $result)
    {
        if (is_array($result)) {
            return json_encode($result);
        }

        // Reverb doesn't require a specific format for private channel auth responses
        return true;
    }

    /**
     * Broadcast the given event.
     *
     * @param  array  $channels
     * @param  string  $event
     * @param  array  $payload
     * @return void
     */
    public function broadcast(array $channels, $event, array $payload = [])
    {
        $payload['event'] = $event;

        // This is a basic implementation. You would typically use a Reverb client
        // to send the message to the Reverb server here.
        // For now, we'll just log that broadcasting occurred.
        \Log::info('Broadcasting event to Reverb', [
            'channels' => $channels,
            'event' => $event,
            'payload' => $payload,
        ]);
    }

    /**
     * Get the guards that should be used for channel authentication.
     *
     * @return \Illuminate\Contracts\Auth\Guard[]
     */
    protected function guards()
    {
        return collect(config('broadcasting.guards'))
            ->map(function ($guard) {
                return auth()->guard($guard);
            })->filter(function ($guard) {
                return $guard->check();
            })->values();
    }
}
