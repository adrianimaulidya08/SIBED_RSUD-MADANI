<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class RoomClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = ['room_id', 'name'];

    /**
     * Get the room that owns this class.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the beds for this class.
     */
    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class, 'class_id');
    }
}
