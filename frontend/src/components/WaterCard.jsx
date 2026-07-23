const WaterCard = ({ title, value, unit, icon, trend, color }) => {
  return (
    <div className="water-card" style={{ '--card-accent': color || '#3b82f6' }}>
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <span className="card-title">{title}</span>
      </div>

      <div className="card-body">
        <span className="card-value">{value ?? '—'}</span>
        {unit && <span className="card-unit">{unit}</span>}
      </div>

      {trend !== undefined && (
        <div className={`card-trend ${trend >= 0 ? 'up' : 'down'}`}>
          <span>{trend >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend)}% from last reading</span>
        </div>
      )}
    </div>
  );
};

export default WaterCard;
