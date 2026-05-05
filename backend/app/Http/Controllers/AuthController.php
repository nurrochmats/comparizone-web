<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Admin login — returns a Sanctum token on success.
     *
     * Security note: error messages must never reveal internal system state.
     * Always return the same generic message for both wrong email AND wrong password
     * (prevents user enumeration attacks).
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Auth::attempt verifies the plain-text password against the stored bcrypt hash.
        // Return the SAME generic message whether the email doesn't exist or password is wrong.
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Only allow admin / superadmin users — but reveal no internal role names
        if (!in_array($user->role, ['admin', 'superadmin'])) {
            Auth::logout();
            return response()->json([
                'message' => 'Akun Anda tidak memiliki akses ke halaman ini.',
            ], 403);
        }

        // Revoke previous tokens so the session is always fresh
        $user->tokens()->delete();

        $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

        // $token = $user->createToken(
        //     'api-token',
        //     ['*'],
        //     now()->addDays(7) // set 7 hari
        // )->plainTextToken;

        // Sisa Waktu Token
        // $token = $request->user()->currentAccessToken();
        // $expires = $token->expires_at;
        // $remaining = $expires
        //     ? $expires->diffForHumans()
        //     : 'never expires';


        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Revoke the current token (logout).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }
}
