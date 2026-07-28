import React from 'react';
import { getStatusFromDistance } from './WaterTank';

const WaterHistoryTable = ({ logs = [] }) => {
  // Sort latest first
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())
  );

  return (
    <div className="history-table-card">
      <div className="table-card-header">
        <div>
          <h3 className="table-title">History Table</h3>
          <p className="table-subtitle">Latest water level readings from ultrasonic sensor</p>
        </div>
        <span className="table-count-badge">{sortedLogs.length} Readings</span>
      </div>

      <div className="table-container">
        <table className="water-data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Distance (cm)</th>
              <th>Water Level (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log, index) => {
              const timeStr = log.created_at
                ? new Date(log.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })
                : '—';

              const distance = Number(log.measured_distance_cm || 0).toFixed(1);
              const percentage = Number(log.water_level_percentage || 0).toFixed(1);
              const statusInfo = getStatusFromDistance(distance, percentage);

              return (
                <tr key={log.id || index} className="table-row">
                  <td className="time-col">{timeStr}</td>
                  <td className="distance-col">{distance} cm</td>
                  <td className="level-col">
                    <span className="table-level-badge">{percentage}%</span>
                  </td>
                  <td className="status-col">
                    <span
                      className={`table-status-pill ${statusInfo.colorClass}`}
                      style={{
                        color: statusInfo.color === '#ffffff' ? '#ffffff' : statusInfo.color,
                        borderColor: statusInfo.color,
                        background: `${statusInfo.color}15`,
                        boxShadow: `0 0 8px ${statusInfo.bgGlow}`,
                      }}
                    >
                      <span className="pill-dot">{statusInfo.dot}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </td>
                </tr>
              );
            })}

            {sortedLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-table-msg">
                  No historical water level data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaterHistoryTable;
