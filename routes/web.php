<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| All requests that are NOT API routes will be handled by this catch-all
| route, which serves the React SPA. React Router handles client-side
| routing from there.
|
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
