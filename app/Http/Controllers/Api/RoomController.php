<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Get rooms based on user role.
     * - Admin: all rooms
     * - Intensive: all rooms
     * - Regular: only their own room
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Room::with(['classes.beds']);

        if ($user->isRegular()) {
            $query->where('id', $user->room_id);
        }

        $rooms = $query->get();

        return response()->json($rooms);
    }

    /**
     * Get a single room with its classes and beds.
     */
    public function show(Request $request, Room $room): JsonResponse
    {
        $user = $request->user();

        // Regular users can only view their own room
        if ($user->isRegular() && $room->id !== $user->room_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $room->load(['classes.beds']);

        return response()->json($room);
    }
}
