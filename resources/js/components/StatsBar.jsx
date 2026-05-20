import './StatsBar.css';

export default function StatsBar({ summary }) {
  const stats = [
    { label: 'Total Bed', value: summary.total, icon: '🏥', color: '#8b5cf6' },
    { label: 'Kosong', value: summary.kosong, icon: '✅', color: '#22c55e' },
    { label: 'Terisi', value: summary.terisi, icon: '🔴', color: '#ef4444' },
    { label: 'Rencana Pulang', value: summary.rencana_pulang, icon: '📋', color: '#eab308' },
    { label: 'Discharge', value: summary.discharge_planning, icon: '📤', color: '#3b82f6' },
    { label: 'Ventilator', value: summary.with_ventilator, icon: '💨', color: '#a855f7' },
  ];

  const occupancyRate = summary.total > 0 ? Math.round((summary.terisi / summary.total) * 100) : 0;

  return (
    <div className="stats-bar">
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card" style={{ '--stat-color': stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="occupancy-bar">
        <div className="occupancy-header">
          <span>Tingkat Hunian</span>
          <span className="occupancy-percent">{occupancyRate}%</span>
        </div>
        <div className="occupancy-track">
          <div className="occupancy-fill" style={{ width: `${occupancyRate}%`, background: occupancyRate > 80 ? '#ef4444' : occupancyRate > 50 ? '#eab308' : '#22c55e' }}></div>
        </div>
      </div>
    </div>
  );
}
