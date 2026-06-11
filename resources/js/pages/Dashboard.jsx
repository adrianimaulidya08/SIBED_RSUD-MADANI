import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import BedCard from '../components/BedCard';
import BedModal from '../components/BedModal';
import StatsBar from '../components/StatsBar';
import FilterBar from '../components/FilterBar';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    class_id: 'all',
    is_ventilator: '',
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
      // Auto-select first room for regular users
      if (data.length === 1 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  }, []);

  const fetchBeds = useCallback(async () => {
    try {
      const params = {};
      if (selectedRoom) params.room_id = selectedRoom.id;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.class_id !== 'all') params.class_id = filters.class_id;
      if (filters.is_ventilator !== '') params.is_ventilator = filters.is_ventilator;

      const { data } = await api.get('/beds', { params });
      setBeds(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch beds:', err);
    }
  }, [selectedRoom, filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get('/beds/summary');
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRooms(), fetchBeds(), fetchSummary()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchBeds();
  }, [selectedRoom, filters]);

  // Polling every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBeds();
      fetchSummary();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchBeds, fetchSummary]);

  const handleBedUpdate = async (bedId, data) => {
    try {
      await api.put(`/beds/${bedId}`, data);
      await Promise.all([fetchBeds(), fetchSummary()]);
      setSelectedBed(null);
    } catch (err) {
      throw err;
    }
  };

  const getClassesForRoom = () => {
    if (!selectedRoom) {
      // Get all unique classes across all rooms
      const allClasses = [];
      rooms.forEach(room => {
        room.classes?.forEach(cls => {
          if (!allClasses.find(c => c.name === cls.name)) {
            allClasses.push(cls);
          }
        });
      });
      return allClasses;
    }
    return selectedRoom.classes || [];
  };

  // Group beds by class
  const groupedBeds = beds.reduce((acc, bed) => {
    const className = bed.room_class?.name || 'Unknown';
    const roomName = bed.room_class?.room?.name || 'Unknown';
    const key = `${roomName} - ${className}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bed);
    return acc;
  }, {});

  const canEditBed = (bed) => {
    if (user.role === 'admin') return true;
    const bedRoomId = bed.room_class?.room_id || bed.room_class?.room?.id;
    return bedRoomId === user.room_id;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-pulse-container">
          <span className="material-symbols-outlined loading-pulse-icon">local_hospital</span>
          <div className="pulse-ring ring-1"></div>
          <div className="pulse-ring ring-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <div>
              <h1>{selectedRoom ? selectedRoom.name : 'Semua Ruangan'}</h1>
              <span className="header-subtitle">
                {selectedRoom
                  ? `Kategori: ${selectedRoom.category === 'general' ? 'Umum' : selectedRoom.category === 'intensive' ? 'Intensif' : 'Jiwa'}`
                  : `${beds.length} tempat tidur ditemukan`
                }
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="last-updated">
              <div className="pulse-dot"></div>
              Update: {lastUpdated.toLocaleTimeString('id-ID')}
            </div>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="user-menu">
              <div className="user-menu-link" onClick={() => navigate('/profile')} title="Buka Profil">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              <button onClick={logout} className="logout-btn" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        {summary && <StatsBar summary={summary} />}

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          classes={getClassesForRoom()}
        />

        {/* Bed Grid */}
        <div className="bed-sections">
          {Object.keys(groupedBeds).length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
                <path d="M7 7V4" />
                <path d="M17 7V4" />
              </svg>
              <h3>Tidak ada tempat tidur ditemukan</h3>
              <p>Coba ubah filter atau pilih ruangan lain</p>
            </div>
          ) : (
            Object.entries(groupedBeds).map(([groupName, groupBeds]) => (
              <div key={groupName} className="bed-section">
                <div className="section-header">
                  <h2>{groupName}</h2>
                  <span className="bed-count">{groupBeds.length} bed</span>
                </div>
                <div className="bed-grid">
                  {groupBeds.map((bed) => (
                    <BedCard
                      key={bed.id}
                      bed={bed}
                      canEdit={canEditBed(bed)}
                      onClick={() => setSelectedBed(bed)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Color Legend */}
        <div className="color-legend">
          <span className="legend-title">Keterangan:</span>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot status-kosong"></span>Kosong
            </div>
            <div className="legend-item">
              <span className="legend-dot status-terisi"></span>Terisi
            </div>
            <div className="legend-item">
              <span className="legend-dot status-rencana_pulang"></span>Rencana Pulang
            </div>
            <div className="legend-item">
              <span className="legend-dot status-discharge_planning"></span>Discharge Planning
            </div>
          </div>
        </div>
      </main>

      {/* Bed Detail Modal */}
      {selectedBed && (
        <BedModal
          bed={selectedBed}
          canEdit={canEditBed(selectedBed)}
          isAdmin={user.role === 'admin'}
          onClose={() => setSelectedBed(null)}
          onUpdate={handleBedUpdate}
        />
      )}
    </div>
  );
}
