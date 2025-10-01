<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Discussion;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::routes();

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('private-discussion.{discussionId}', function ($user, $discussionId) {
    $discussion = Discussion::find($discussionId);

    if (!$discussion) {
        return false;
    }

    // Authorize only if the user is part of the discussion
    return $user->id === $discussion->sender_id || $user->id === $discussion->recipient_id;
});
