import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const categoryLabels = {
  general: 'Pasien Umum',
  intensive: 'Pasien Intensif',
  psychiatric: 'Pasien Jiwa',
};

const categoryIcons = {
  general: 'local_hospital',
  intensive: 'monitor_heart',
  psychiatric: 'psychiatry',
};

const getRoomIcon = (category, name) => {
  const nameLower = name.toLowerCase();
  
  // Specific intensive rooms
  if (nameLower.includes('icu') && !nameLower.includes('picu') && !nameLower.includes('nicu') && !nameLower.includes('iccu')) return 'monitor_heart';
  if (nameLower.includes('picu')) return 'child_care';
  if (nameLower.includes('nicu')) return 'baby_changing_station';
  if (nameLower.includes('iccu')) return 'vital_signs';
  
  // Specific psychiatric/jiwa rooms
  if (category === 'psychiatric') {
    if (nameLower.includes('napza')) return 'medical_information';
    return nameLower.includes('b') ? 'psychology' : 'psychiatry';
  }
  
  // General category rooms mapping
  if (category === 'general') {
    if (nameLower.includes('mawar')) return 'emergency';
    if (nameLower.includes('melati')) return 'medical_services';
    if (nameLower.includes('anggrek')) return 'local_hospital';
    if (nameLower.includes('dahlia')) return 'healing';
    
    // Fruit names / generic fallback icons
    const icons = ['emergency', 'medical_services', 'local_hospital', 'healing', 'vaccines', 'health_and_safety', 'pill'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return icons[Math.abs(hash) % icons.length];
  }
  
  if (category === 'intensive') {
    return 'monitor_heart';
  }
  
  return 'local_hospital';
};

export default function Sidebar({ rooms, selectedRoom, onSelectRoom, isOpen, onToggle, user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = searchQuery.trim()
    ? rooms.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : rooms;

  const grouped = filteredRooms.reduce((acc, room) => {
    if (!acc[room.category]) acc[room.category] = [];
    acc[room.category].push(room);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src="/logo.jpg" alt="Logo" className="logo-img" />
          </div>
          {isOpen && (
            <div className="logo-text-wrapper">
              <span className="logo-text">BedMonitor</span>
              <span className="logo-subtext">RSUD Madani</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {isOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {(user.role === 'admin' || user.role === 'intensive') && (
          <button
            className={`nav-item ${!selectedRoom ? 'active' : ''}`}
            onClick={() => onSelectRoom(null)}
          >
            <span className="material-symbols-outlined nav-icon">grid_view</span>
            {isOpen && <span className="nav-label">Semua Ruangan</span>}
          </button>
        )}

        {isOpen && (
          <div className="sidebar-search">
            <span className="material-symbols-outlined sidebar-search-icon">search</span>
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Cari ruangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="sidebar-search-clear" onClick={() => setSearchQuery('')}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            )}
          </div>
        )}

        {Object.entries(grouped).map(([category, categoryRooms]) => (
          <div key={category} className="nav-category">
            {isOpen && (
              <div className="category-header">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {categoryIcons[category]}
                </span>
                <span>{categoryLabels[category]}</span>
              </div>
            )}
            {categoryRooms.map((room) => (
              <button
                key={room.id}
                className={`nav-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
                title={room.name}
              >
                <span className="material-symbols-outlined nav-icon" style={{ fontSize: '18px' }}>
                  {getRoomIcon(category, room.name)}
                </span>
                {isOpen && <span className="nav-label">{room.name}</span>}
              </button>
            ))}
          </div>
        ))}

        {/* Admin Panel Link */}
        {user.role === 'admin' && (
          <div className="nav-category">
            {isOpen && (
              <div className="category-header">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
                <span>Manajemen</span>
              </div>
            )}
            <button
              className="nav-item nav-admin"
              onClick={() => navigate('/admin')}
              title="Admin Panel"
            >
              <span className="material-symbols-outlined nav-icon">settings</span>
              {isOpen && <span className="nav-label">Admin Panel</span>}
            </button>
          </div>
        )}

        {/* Profile Link */}
        <div className="nav-category">
          {isOpen && (
            <div className="category-header">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>account_circle</span>
              <span>Akun</span>
            </div>
          )}
          <button
            className="nav-item nav-profile"
            onClick={() => navigate('/profile')}
            title="Profil Saya"
          >
            <span className="material-symbols-outlined nav-icon">person</span>
            {isOpen && <span className="nav-label">Profil Saya</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
