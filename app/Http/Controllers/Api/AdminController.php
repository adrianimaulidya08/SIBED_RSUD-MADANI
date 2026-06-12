<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bed;
use App\Models\Room;
use App\Models\RoomClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ==================== ROOM MANAGEMENT ====================

    /**
     * List all rooms.
     */
    public function indexRooms(): JsonResponse
    {
        $rooms = Room::withCount(['classes'])->get();
        return response()->json($rooms);
    }

    /**
     * Create a new room.
     */
    public function storeRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:general,intensive,psychiatric',
        ]);

        $room = Room::create($validated);

        return response()->json($room, 201);
    }

    /**
     * Update a room.
     */
    public function updateRoom(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:general,intensive,psychiatric',
        ]);

        $room->update($validated);

        return response()->json($room);
    }

    /**
     * Delete a room.
     */
    public function destroyRoom(Room $room): JsonResponse
    {
        $room->delete();
        return response()->json(['message' => 'Room berhasil dihapus.']);
    }

    // ==================== CLASS MANAGEMENT ====================

    /**
     * List classes for a room.
     */
    public function indexClasses(Room $room): JsonResponse
    {
        $classes = $room->classes()->withCount('beds')->get();
        return response()->json($classes);
    }

    /**
     * Create a new class in a room.
     */
    public function storeClass(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $class = $room->classes()->create($validated);

        return response()->json($class, 201);
    }

    /**
     * Update a class.
     */
    public function updateClass(Request $request, RoomClass $class): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
        ]);

        $class->update($validated);

        return response()->json($class);
    }

    /**
     * Delete a class.
     */
    public function destroyClass(RoomClass $class): JsonResponse
    {
        $class->delete();
        return response()->json(['message' => 'Class berhasil dihapus.']);
    }

    // ==================== BED MANAGEMENT ====================

    /**
     * Create a new bed.
     */
    public function storeBed(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'code' => 'required|string|max:50',
            'is_ventilator' => 'boolean',
            'is_isolation' => 'boolean',
            'status' => 'in:kosong,terisi,rencana_pulang,discharge_planning',
        ]);

        $bed = Bed::create($validated);

        return response()->json($bed, 201);
    }

    /**
     * Update a bed (admin full edit).
     */
    public function updateBed(Request $request, Bed $bed): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50',
            'class_id' => 'sometimes|required|exists:classes,id',
            'is_ventilator' => 'sometimes|boolean',
            'is_isolation' => 'sometimes|boolean',
            'status' => 'sometimes|in:kosong,terisi,rencana_pulang,discharge_planning',
            'deskripsi' => 'nullable|string|max:1000',
        ]);

        $bed->update($validated);

        return response()->json($bed->load('roomClass.room'));
    }

    /**
     * Delete a bed.
     */
    public function destroyBed(Bed $bed): JsonResponse
    {
        $bed->delete();
        return response()->json(['message' => 'Bed berhasil dihapus.']);
    }

    // ==================== USER MANAGEMENT ====================

    /**
     * List all users.
     */
    public function indexUsers(): JsonResponse
    {
        $users = User::with('room')->where('role', '!=', 'admin')->get();
        return response()->json($users);
    }

    /**
     * Create a new user.
     */
    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:intensive,regular',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        // Check if room already has a petugas
        if (!empty($validated['room_id'])) {
            $existing = User::where('room_id', $validated['room_id'])
                            ->where('role', '!=', 'admin')
                            ->exists();
            if ($existing) {
                return response()->json([
                    'message' => 'Ruangan ini sudah memiliki petugas.'
                ], 422);
            }
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = true;

        $user = User::create($validated);

        return response()->json($user->load('room'), 201);
    }

    /**
     * Update a user.
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $user->id,
            'password' => 'sometimes|nullable|string|min:6',
            'role' => 'sometimes|required|in:intensive,regular',
            'room_id' => 'nullable|exists:rooms,id',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->load('room'));
    }

    /**
     * Delete a user.
     */
    public function destroyUser(User $user): JsonResponse
    {
        if ($user->room_id) {
            $user->room()->delete();
        }

        $user->delete();
        return response()->json(['message' => 'User dan ruangan terkait berhasil dihapus.']);
    }

    /**
     * Toggle user active status.
     */
    public function toggleUserActive(User $user): JsonResponse
    {
        // Don't allow deactivating admin
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Admin tidak bisa dinonaktifkan.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'User diaktifkan.' : 'User dinonaktifkan.',
            'user' => $user->load('room'),
        ]);
    }
}
