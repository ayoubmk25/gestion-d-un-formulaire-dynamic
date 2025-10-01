<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RootUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Root User',
            'email' => 'root@example.com',
            'password' => hash::make('password'),
            'role' => 'root',
        ]);
    }
}
