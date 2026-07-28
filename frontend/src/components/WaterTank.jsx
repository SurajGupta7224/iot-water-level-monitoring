import React from 'react';

// Color Rules based strictly on Distance:
// Distance >= 15 cm => Empty (Red)
// Distance 10 cm to < 15 cm => Low (Yellow)
// Distance 5 cm to < 10 cm => Medium (White)
// Distance < 5 cm => Full (Green)
export const getStatusFromDistance = (distanceCm, percentage = 0) => {
  const dist = Number(distanceCm);
  
  if (!isNaN(dist) && dist !== null && dist > 0) {
    if (dist >= 15) {
      return { label: 'Empty', color: '#ef4444', colorClass: 'status-red', bgGlow: 'rgba(239, 68, 68, 0.4)', dot: '🔴', key: 'empty' };
    }
    if (dist >= 10) {
      return { label: 'Low', color: '#f59e0b', colorClass: 'status-yellow', bgGlow: 'rgba(245, 158, 11, 0.4)', dot: '🟡', key: 'low' };
    }
    if (dist >= 5) {
      return { label: 'Medium', color: '#ffffff', colorClass: 'status-white', bgGlow: 'rgba(255, 255, 255, 0.3)', dot: '⚪', key: 'medium' };
    }
    return { label: 'Full', color: '#10b981', colorClass: 'status-green', bgGlow: 'rgba(16, 185, 129, 0.4)', dot: '🟢', key: 'full' };
  }

  // Fallback to percentage if distance is not provided
  const pct = Number(percentage) || 0;
  if (pct <= 20) return { label: 'Empty', color: '#ef4444', colorClass: 'status-red', bgGlow: 'rgba(239, 68, 68, 0.4)', dot: '🔴', key: 'empty' };
  if (pct <= 45) return { label: 'Low', color: '#f59e0b', colorClass: 'status-yellow', bgGlow: 'rgba(245, 158, 11, 0.4)', dot: '🟡', key: 'low' };
  if (pct <= 80) return { label: 'Medium', color: '#ffffff', colorClass: 'status-white', bgGlow: 'rgba(255, 255, 255, 0.3)', dot: '⚪', key: 'medium' };
  return { label: 'Full', color: '#10b981', colorClass: 'status-green', bgGlow: 'rgba(16, 185, 129, 0.4)', dot: '🟢', key: 'full' };
};

const WaterTank = ({ percentage = 0, distanceCm = 0 }) => {
  const levelPct = Math.min(Math.max(Number(percentage) || 0, 0), 100);
  const statusInfo = getStatusFromDistance(distanceCm, levelPct);

  const statusCategories = [
    { key: 'empty', label: 'Empty', range: 'Distance ≥ 15 cm', icon: '🔴', color: '#ef4444' },
    { key: 'low',   label: 'Low',   range: 'Distance 10 - 15 cm', icon: '🟡', color: '#f59e0b' },
    { key: 'medium',label: 'Medium',range: 'Distance 5 - 10 cm', icon: '⚪', color: '#ffffff' },
    { key: 'full',  label: 'Full',  range: 'Distance < 5 cm', icon: '🟢', color: '#10b981' },
  ];

  return (
    <div className="tank-visualization-card">
      <div className="tank-visualization-header">
        <div>
          <h3 className="tank-section-title">Animated Water Tank Visualization</h3>
          <p className="tank-section-subtitle">Real-time ultrasonic level telemetry</p>
        </div>
      </div>

      <div className="tank-main-flex">
        {/* Large Animated Water Tank */}
        <div className="tank-outer-frame">
          <div className="tank-scale-marks">
            <span className="mark">100%</span>
            <span className="mark">80%</span>
            <span className="mark">60%</span>
            <span className="mark">40%</span>
            <span className="mark">20%</span>
            <span className="mark">0%</span>
          </div>

          <div className="tank-cylinder">
            <div className="glass-reflection"></div>

            {/* Dynamic Water Container */}
            <div
              className="water-fill-container"
              style={{
                height: `${levelPct}%`,
              }}
            >
              {/* Waves */}
              <div className="wave wave1"></div>
              <div className="wave wave2"></div>
              <div className="water-body-gradient"></div>
              
              {/* Water Bubbles */}
              <div className="bubble b1"></div>
              <div className="bubble b2"></div>
              <div className="bubble b3"></div>
            </div>
          </div>
        </div>

        {/* Tank Side Details Panel */}
        <div className="tank-details-side">
          <div className="readout-card">
            <div className="readout-item">
              <span className="readout-label">Water Level</span>
              <span className="readout-val text-cyan">{levelPct.toFixed(1)}%</span>
            </div>
            <div className="readout-divider"></div>
            <div className="readout-item">
              <span className="readout-label">Distance</span>
              <span className="readout-val text-purple">{Number(distanceCm || 0).toFixed(1)} cm</span>
            </div>
            <div className="readout-divider"></div>
            <div className="readout-item">
              <span className="readout-label">Status</span>
              <span
                className="readout-status-badge"
                style={{
                  color: statusInfo.color === '#ffffff' ? '#ffffff' : statusInfo.color,
                  borderColor: statusInfo.color,
                  boxShadow: `0 0 14px ${statusInfo.bgGlow}`,
                  background: `${statusInfo.color}15`
                }}
              >
                {statusInfo.dot} {statusInfo.label}
              </span>
            </div>
          </div>

          {/* WATER LEVEL STATUS INDICATORS (Four colored status indicators) */}
          <div className="status-indicators-box">
            <h4 className="indicators-title">Water Level Threshold Indicators</h4>
            <div className="indicators-grid">
              {statusCategories.map((item) => {
                const isActive = statusInfo.key === item.key;
                return (
                  <div
                    key={item.key}
                    className={`status-indicator-card ${isActive ? 'active-status' : 'inactive-status'}`}
                    style={{
                      '--indicator-color': item.color,
                      borderColor: isActive ? item.color : 'rgba(255,255,255,0.06)',
                      boxShadow: isActive ? `0 0 20px ${item.color}40` : 'none',
                    }}
                  >
                    <div className="indicator-icon">{item.icon}</div>
                    <div className="indicator-info">
                      <span className="indicator-label" style={{ color: isActive ? (item.color === '#ffffff' ? '#ffffff' : item.color) : 'var(--text-secondary)' }}>
                        {item.label}
                      </span>
                      <span className="indicator-range">{item.range}</span>
                    </div>
                    {isActive && <span className="active-glow-dot"></span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTank;
