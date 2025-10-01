<?php
return [

    'default' => env('BROADCAST_DRIVER', 'reverb'),

    'connections' => [

        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS' => true,
            ],
        ],

        'ably' => [/* ... */],

        'redis' => [/* ... */],

        'log' => [/* ... */],

        'null' => [/* ... */],

        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'host' => env('REVERB_HOST', 'localhost'),
            'port' => env('REVERB_PORT', 8081),
            'scheme' => env('REVERB_SCHEME', 'http'),
            'verify_ssl' => false,
        ],

    ],
];
