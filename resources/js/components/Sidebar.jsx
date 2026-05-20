import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const categoryLabels = {
  general: 'Umum',
  intensive: 'Intensif',
  psychiatric: 'Jiwa',
};

const categoryIcons = {
  general: '🏥',
  intensive: '🫀',
  psychiatric: '🧠',
};

export default function Sidebar({ rooms, selectedRoom, onSelectRoom, isOpen, onToggle, user }) {
  const navigate = useNavigate();

  const grouped = rooms.reduce((acc, room) => {
    if (!acc[room.category]) acc[room.category] = [];
    acc[room.category].push(room);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M12 6v4"/>
            </svg>
          </div>
          {isOpen && <span className="logo-text">BedMonitor</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 18l6-6-6-6"/>}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {(user.role === 'admin' || user.role === 'intensive') && (
          <button
            className={`nav-item ${!selectedRoom ? 'active' : ''}`}
            onClick={() => onSelectRoom(null)}
          >
            <span className="nav-icon">📊</span>
            {isOpen && <span className="nav-label">Semua Ruangan</span>}
          </button>
        )}

        {Object.entries(grouped).map(([category, categoryRooms]) => (
          <div key={category} className="nav-category">
            {isOpen && (
              <div className="category-header">
                <span>{categoryIcons[category]}</span>
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
                <span className="nav-dot" style={{
                  background: category === 'intensive' ? '#ef4444' : category === 'psychiatric' ? '#a855f7' : '#22c55e'
                }}></span>
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
                <span>⚙️</span>
                <span>Manajemen</span>
              </div>
            )}
            <button
              className="nav-item nav-admin"
              onClick={() => navigate('/admin')}
              title="Admin Panel"
            >
              <span className="nav-icon">🛠️</span>
              {isOpen && <span className="nav-label">Admin Panel</span>}
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
