<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'visitor_id' => 'required|uuid',
            'event_type' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        DB::table('marketing.events')->insert([
            'visitor_id' => $request->visitor_id,
            'event_type' => $request->event_type,
            'event_name' => $request->event_name ?? null,
            'metadata' => json_encode($request->metadata),
            'created_at' => now(),
        ]);

        return response()->json(['status' => 'ok']);
    }
}
