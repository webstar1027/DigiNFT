<?php

namespace App\Providers;

use App\Http\Responders\JsonResponder;
use App\Http\Responders\ResponderInterface;
use App\Http\Responders\TransformResponder;
use App\Http\Responders\TransformResponderInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(ResponderInterface::class, JsonResponder::class);
        $this->app->bind(TransformResponderInterface::class, TransformResponder::class);
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Model::preventLazyLoading(!$this->app->isProduction());
    }
}
