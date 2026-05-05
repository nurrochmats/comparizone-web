<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * NOTE: Do NOT wrap the password with Hash::make() here.
     *       The User model has a 'password' => 'hashed' cast which
     *       automatically hashes the value on assignment.
     *       Manually calling Hash::make() first would double-hash the
     *       password, causing Auth::attempt() to always fail.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'nurrochmat.sapto@gmail.com'],
            [
                'name'     => 'Superadmin',
                'password' => '!Pesantren4498',   // plain-text — model cast hashes it
                'role'     => 'superadmin',
            ]
        );
    }
}
