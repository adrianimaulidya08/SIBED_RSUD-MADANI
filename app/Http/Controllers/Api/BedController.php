<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bed;
use App\Models\BedLog;
use App\Models\RoomClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BedController extends Controller
{
    /**
     * Get beds with filtering support.
     * Filters: status, class_id, is_ventilator, room_id
     * Role-based access:
     * - Admin/Intensive: can see all beds
     * - Regular: can only see beds in their room
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Bed::with(['roomClass.room'])
            ->select('beds.*');

        // Role-based filtering
        if ($user->isRegular()) {
            // Regular user: only beds in their room
            $classIds = RoomClass::where('room_id', $user->room_id)->pluck('id');
            $query->whereIn('class_id', $classIds);
        } elseif ($request->has('room_id')) {
            // Intensive/Admin can filter by room
            $classIds = RoomClass::where('room_id', $request->room_id)->pluck('id');
            $query->whereIn('class_id', $classIds);
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Class filter
        if ($request->has('class_id') && $request->class_id !== 'all') {
            $query->where('class_id', $request->class_id);
        }

        // Ventilator filter
        if ($request->has('is_ventilator')) {
            $query->where('is_ventilator', filter_var($request->is_ventilator, FILTER_VALIDATE_BOOLEAN));
        }

        // Isolation filter
        if ($request->has('is_isolation')) {
            $query->where('is_isolation', filter_var($request->is_isolation, FILTER_VALIDATE_BOOLEAN));
        }

        $beds = $query->orderBy('code')->get();

        return response()->json($beds);
    }

    /**
     * Update bed status and description.
     * Users can only update beds in their own room.
     */
    public function update(Request $request, Bed $bed): JsonResponse
    {
        $user = $request->user();

        // Load the bed's room relationship
        $bed->load('roomClass.room');

        // Check if user can update this bed (must be in their room, unless admin)
        if (!$user->isAdmin()) {
            $bedRoomId = $bed->roomClass->room_id;
            if ($bedRoomId !== $user->room_id) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk mengubah bed di ruangan ini.'
                ], 403);
            }
        }

        $rules = [
            'status' => 'sometimes|required|in:kosong,terisi,rencana_pulang,discharge_planning',
            'deskripsi' => 'nullable|string|max:1000',
        ];

        // Admin can also update isolation and ventilator
        if ($user->isAdmin()) {
            $rules['is_isolation'] = 'sometimes|boolean';
            $rules['is_ventilator'] = 'sometimes|boolean';
        }

        $validated = $request->validate($rules);

        // Log the change
        BedLog::create([
            'bed_id' => $bed->id,
            'old_status' => $bed->status,
            'new_status' => $validated['status'] ?? $bed->status,
            'old_deskripsi' => $bed->deskripsi,
            'new_deskripsi' => $validated['deskripsi'] ?? $bed->deskripsi,
            'changed_by' => $user->name,
        ]);

        // Update the bed
        $bed->update(array_merge($validated, [
            'updated_by' => $user->name,
        ]));

        $bed->load('roomClass.room');

        return response()->json([
            'message' => 'Bed berhasil diperbarui.',
            'bed' => $bed,
        ]);
    }

    /**
     * Get bed summary/statistics.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Bed::query();

        if ($user->isRegular()) {
            $classIds = RoomClass::where('room_id', $user->room_id)->pluck('id');
            $query->whereIn('class_id', $classIds);
        }

        $total = (clone $query)->count();
        $kosong = (clone $query)->where('status', 'kosong')->count();
        $terisi = (clone $query)->where('status', 'terisi')->count();
        $rencanaPulang = (clone $query)->where('status', 'rencana_pulang')->count();
        $dischargePlanning = (clone $query)->where('status', 'discharge_planning')->count();
        $withVentilator = (clone $query)->where('is_ventilator', true)->count();

        return response()->json([
            'total' => $total,
            'kosong' => $kosong,
            'terisi' => $terisi,
            'rencana_pulang' => $rencanaPulang,
            'discharge_planning' => $dischargePlanning,
            'with_ventilator' => $withVentilator,
        ]);
    }
}
