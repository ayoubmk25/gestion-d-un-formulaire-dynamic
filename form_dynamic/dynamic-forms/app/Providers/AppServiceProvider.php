<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Broadcasting\BroadcastManager;
use App\Broadcasting\ReverbBroadcaster;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->make(BroadcastManager::class)->extend('reverb', function ($app, $config) {
            return new ReverbBroadcaster($config);
        });
    }
}
