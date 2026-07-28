import React from 'react';

const WaterCard = ({ title, value, unit, icon, color, statusBadge }) => {
  return (
    <div className="water-card-v2" style={{ '--card-accent': color }}>
      <div className="card-top">
        <span className="card-title-v2">{title}</span>
        <div className="card-icon-wrapper" style={{ color: color, background: `${color}18`, borderColor: `${color}33` }}>
          {icon}
        </div>
      </div>
      <div className="card-content-v2">
        {statusBadge ? (
          <div
            className={`status-badge-pill ${statusBadge.colorClass}`}
            style={{
              borderColor: statusBadge.color,
              color: statusBadge.color === '#ffffff' ? '#ffffff' : statusBadge.color,
              boxShadow: `0 0 12px ${statusBadge.bgGlow}`
            }}
          >
            <span className="badge-dot-indicator">{statusBadge.dot}</span>
            <span className="badge-text-label">{statusBadge.label}</span>
          </div>
        ) : (
          <div className="card-value-group">
            <span className="card-val">{value}</span>
            {unit && <span className="card-unit-text">{unit}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterCard;
