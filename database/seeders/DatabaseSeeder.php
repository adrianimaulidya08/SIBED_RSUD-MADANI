<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\Room;
use App\Models\RoomClass;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ==================== ROOMS ====================
        $rooms = [
            // General rooms
            ['name' => 'Ruang Mawar', 'category' => 'general'],
            ['name' => 'Ruang Melati', 'category' => 'general'],
            ['name' => 'Ruang Anggrek', 'category' => 'general'],
            // Intensive rooms
            ['name' => 'ICU', 'category' => 'intensive'],
            ['name' => 'PICU', 'category' => 'intensive'],
            ['name' => 'NICU', 'category' => 'intensive'],
            ['name' => 'ICCU', 'category' => 'intensive'],
            // Psychiatric rooms
            ['name' => 'Ruang Jiwa A', 'category' => 'psychiatric'],
            ['name' => 'Ruang Jiwa B', 'category' => 'psychiatric'],
        ];

        $createdRooms = [];
        foreach ($rooms as $room) {
            $createdRooms[] = Room::create($room);
        }

        // ==================== CLASSES FOR EACH ROOM ====================
        $classNames = ['VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3'];
        $statuses = ['kosong', 'terisi', 'rencana_pulang', 'discharge_planning'];

        foreach ($createdRooms as $room) {
            foreach ($classNames as $className) {
                $class = RoomClass::create([
                    'room_id' => $room->id,
                    'name' => $className,
                ]);

                // Create beds for each class
                $bedCount = match ($className) {
                    'VIP' => 3,
                    'Kelas 1' => 5,
                    'Kelas 2' => 6,
                    'Kelas 3' => 8,
                };

                for ($i = 1; $i <= $bedCount; $i++) {
                    $prefix = strtoupper(substr(str_replace(['Ruang ', ' '], '', $room->name), 0, 3));
                    $classPrefix = match ($className) {
                        'VIP' => 'V',
                        'Kelas 1' => 'K1',
                        'Kelas 2' => 'K2',
                        'Kelas 3' => 'K3',
                    };

                    Bed::create([
                        'class_id' => $class->id,
                        'code' => "{$prefix}-{$classPrefix}-" . str_pad($i, 2, '0', STR_PAD_LEFT),
                        'is_ventilator' => $room->category === 'intensive' && rand(0, 1),
                        'is_isolation' => rand(0, 4) === 0, // ~20% chance
                        'status' => $statuses[array_rand($statuses)],
                        'deskripsi' => rand(0, 1) ? null : 'Catatan bed ' . $i,
                        'updated_by' => 'System',
                    ]);
                }
            }
        }

        // ==================== USERS ====================
        // Admin user
        User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'room_id' => null,
        ]);

        // Intensive room users
        $intensiveRooms = Room::where('category', 'intensive')->get();
        foreach ($intensiveRooms as $room) {
            $username = strtolower(str_replace(' ', '_', $room->name));
            User::create([
                'name' => "Perawat {$room->name}",
                'username' => $username,
                'password' => Hash::make('password'),
                'role' => 'intensive',
                'room_id' => $room->id,
            ]);
        }

        // Regular room users
        $regularRooms = Room::whereIn('category', ['general', 'psychiatric'])->get();
        foreach ($regularRooms as $room) {
            $username = strtolower(str_replace([' ', 'Ruang '], ['_', ''], $room->name));
            User::create([
                'name' => "Perawat {$room->name}",
                'username' => $username,
                'password' => Hash::make('password'),
                'role' => 'regular',
                'room_id' => $room->id,
            ]);
        }
    }
}
