import React, { useState } from 'react';

const WaterChart = ({ logs = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Take the last 15 readings and reverse so oldest is left, latest is right
  const chartData = [...logs]
    .slice(0, 15)
    .reverse()
    .map((log) => {
      const timeStr = log.created_at
        ? new Date(log.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
        : '—';
      const pct = Number(log.water_level_percentage) || 0;
      const dist = Number(log.measured_distance_cm) || 0;
      return {
        time: timeStr,
        level: pct,
        distance: dist,
        status: log.tank_status || 'NORMAL',
      };
    });

  // Use strictly actual telemetry data
  const data = chartData;


  // SVG dimensions
  const width = 800;
  const height = 260;
  const paddingX = 55;
  const paddingY = 35;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartW;
    const clampedLevel = Math.min(Math.max(d.level, 0), 100);
    const y = paddingY + chartH - (clampedLevel / 100) * chartH;
    return { ...d, x, y };
  });

  // Construct SVG path for area & line
  const pathD = points.length > 0
    ? points.reduce((acc, point, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="water-chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Water Level History</h3>
          <p className="chart-subtitle">Real-time water level trend over time</p>
        </div>
        <div className="chart-legend">
          <span className="legend-dot"></span>
          <span className="legend-text">Water Level (%)</span>
        </div>
      </div>

      <div className="chart-svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingY + chartH - (val / 100) * chartH;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 12}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Empty Chart Message */}
          {data.length === 0 && (
            <text
              x={width / 2}
              y={height / 2}
              fill="var(--text-muted)"
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
            >
              No water level telemetry recorded yet.
            </text>
          )}

          {/* Area Fill */}
          {data.length > 0 && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Line Path */}
          {data.length > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Data Points & X-Axis Labels */}
          {data.length > 0 && points.map((pt, i) => (
            <g
              key={i}
              className="chart-point-group"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Vertical guideline on hover */}
              {hoveredPoint === pt && (
                <line
                  x1={pt.x}
                  y1={paddingY}
                  x2={pt.x}
                  y2={height - paddingY}
                  stroke="rgba(59, 130, 246, 0.4)"
                  strokeDasharray="3 3"
                />
              )}

              {/* Point Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === pt ? "6.5" : "4.5"}
                fill="#0b0f19"
                stroke={hoveredPoint === pt ? "#ffffff" : "#06b6d4"}
                strokeWidth="2.5"
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* X-Axis Label */}
              <text
                x={pt.x}
                y={height - paddingY + 18}
                fill="var(--text-muted)"
                fontSize="9.5"
                fontWeight="600"
                textAnchor="middle"
              >
                {pt.time}
              </text>
            </g>
          ))}

        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="tooltip-time">{hoveredPoint.time}</div>
            <div className="tooltip-val">Level: <strong>{hoveredPoint.level.toFixed(1)}%</strong></div>
            <div className="tooltip-sub">Distance: {hoveredPoint.distance} cm</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterChart;
