<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category'];

    /**
     * Get the classes for the room.
     */
    public function classes(): HasMany
    {
        return $this->hasMany(RoomClass::class);
    }

    /**
     * Get the users assigned to this room.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
