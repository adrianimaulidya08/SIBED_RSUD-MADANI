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

            // ================= GENERAL =================
            ['name' => 'Markisa', 'category' => 'general'],
            ['name' => 'Melon', 'category' => 'general'],
            ['name' => 'Jeruk', 'category' => 'general'],
            ['name' => 'Rambutan', 'category' => 'general'],
            ['name' => 'Cherry', 'category' => 'general'],
            ['name' => 'Durian', 'category' => 'general'],
            ['name' => 'Semangka', 'category' => 'general'],
            ['name' => 'Lecy', 'category' => 'general'],

            // ================= PSYCHIATRIC =================
            ['name' => 'Salak', 'category' => 'psychiatric'],
            ['name' => 'Serikaya', 'category' => 'psychiatric'],
            ['name' => 'Anggur', 'category' => 'psychiatric'],
            ['name' => 'Manggis', 'category' => 'psychiatric'],
            ['name' => 'Sawo', 'category' => 'psychiatric'],
            ['name' => 'Napa', 'category' => 'psychiatric'],

            // ================= INTENSIVE =================
            ['name' => 'NICU', 'category' => 'intensive'],
            ['name' => 'PICU', 'category' => 'intensive'],
            ['name' => 'ICU', 'category' => 'intensive'],
            ['name' => 'ICCU', 'category' => 'intensive'],
        ];

        $createdRooms = [];

        foreach ($rooms as $room) {
            $createdRooms[] = Room::create($room);
        }

        // ==================== ROOM CLASS & BEDS ====================

        $statuses = [
            'kosong',
            'terisi',
            'rencana_pulang',
            'discharge_planning'
        ];

        // Data jumlah bed sesuai tabel
        $roomBedData = [

            // ================= GENERAL =================
            'Markisa' => [
                'VIP A' => 7,
            ],

            'Melon' => [
                'VIP B' => 4,
                'Kelas I' => 6,
                'Kelas II' => 6,
                'Isolasi' => 2,
            ],

            'Jeruk' => [
                'Kelas III' => 12,
                'Isolasi' => 4,
            ],

            'Rambutan' => [
                'Kelas III' => 16,
                'Isolasi' => 4,
            ],

            'Cherry' => [
                'Kelas III' => 12,
                'Isolasi' => 3,
            ],

            'Durian' => [
                'Kelas I' => 3,
                'Kelas II' => 8,
                'Kelas III' => 14,
                'Isolasi' => 6,
            ],

            'Semangka' => [
                'Kelas I' => 2,
                'Kelas II' => 3,
                'Kelas III' => 8,
            ],

            'Lecy' => [
                'Kelas I' => 1,
                'Kelas II' => 2,
                'Isolasi' => 2,
            ],

            // ================= PSYCHIATRIC =================
            'Salak' => [
                'Kelas III' => 18,
            ],

            'Serikaya' => [
                'Kelas III' => 17,
            ],

            'Anggur' => [
                'Kelas I' => 2,
                'Kelas II' => 3,
                'Kelas III' => 7,
                'Isolasi' => 3,
            ],

            'Manggis' => [
                'Kelas III' => 16,
            ],

            'Sawo' => [
                'Kelas III' => 22,
            ],

            'Napa' => [
                'Kelas III' => 3,
            ],

            // ================= INTENSIVE =================
            'NICU' => [
                'Non Kelas' => 8,
            ],

            'PICU' => [
                'Non Kelas' => 3,
            ],

            'ICU' => [
                'Non Kelas' => 6,
                'Isolasi' => 1,
            ],

            'ICCU' => [
                'Non Kelas' => 5,
            ],
        ];

        foreach ($createdRooms as $room) {

            if (!isset($roomBedData[$room->name])) {
                continue;
            }

            foreach ($roomBedData[$room->name] as $className => $bedCount) {

                $class = RoomClass::create([
                    'room_id' => $room->id,
                    'name' => $className,
                ]);

                for ($i = 1; $i <= $bedCount; $i++) {

                    $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $room->name), 0, 4));

                    $classPrefix = match ($className) {
                        'VIP A' => 'VIPA',
                        'VIP B' => 'VIPB',
                        'Kelas I' => 'K1',
                        'Kelas II' => 'K2',
                        'Kelas III' => 'K3',
                        'Non Kelas' => 'NK',
                        'Isolasi' => 'ISO',
                        default => 'BED',
                    };

                    Bed::create([
                        'class_id' => $class->id,
                        'code' => "{$prefix}-{$classPrefix}-" . str_pad($i, 2, '0', STR_PAD_LEFT),

                        // otomatis true jika nama ruangan ventilator
                        'is_ventilator' => str_contains(
                            strtolower($room->name),
                            'ventilator'
                        ),

                        // otomatis true jika class isolasi
                        'is_isolation' => $className === 'Isolasi',

                        'status' => $statuses[array_rand($statuses)],
                        'deskripsi' => null,
                        'updated_by' => 'System',
                    ]);
                }
            }
        }

        // ==================== USERS ====================

        // ADMIN
        User::create([
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'room_id' => null,
        ]);

        // INTENSIVE USERS
        $intensiveRooms = Room::where('category', 'intensive')->get();

        foreach ($intensiveRooms as $room) {

            $username = strtolower(
                str_replace([' ', '-'], '_', $room->name)
            );

            User::create([
                'name' => "Perawat {$room->name}",
                'username' => $username,
                'password' => Hash::make('password'),
                'role' => 'intensive',
                'room_id' => $room->id,
            ]);
        }

        // GENERAL + PSYCHIATRIC USERS
        // Ruangan jiwa menggunakan role regular
        $regularRooms = Room::whereIn('category', [
            'general',
            'psychiatric'
        ])->get();

        foreach ($regularRooms as $room) {

            $username = strtolower(
                str_replace([' ', '-'], '_', $room->name)
            );

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
