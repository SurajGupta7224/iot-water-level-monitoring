import { useEffect, useState } from 'react';
import { waterAPI } from '../services/api';
import { getStatusFromDistance } from '../components/WaterTank';

const WaterLogs = () => {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await waterAPI.getAll();
      setLogs(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this historical water reading?')) return;
    try {
      await waterAPI.remove(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      alert(`Failed to delete reading: ${err.message}`);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const distanceStr = log.measured_distance_cm ? `${log.measured_distance_cm} cm` : '';
    const levelStr = log.water_level_percentage ? `${log.water_level_percentage}%` : '';
    const statusInfo = getStatusFromDistance(log.measured_distance_cm, log.water_level_percentage);

    return (
      statusInfo.label.toLowerCase().includes(term) ||
      levelStr.toLowerCase().includes(term) ||
      distanceStr.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="page-center-loader">
        <div className="water-ripple-spinner"></div>
        <p className="loader-text">Loading Historical Water Logs…</p>
      </div>
    );
  }

  return (
    <div className="history-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Water Level History</h1>
          <p className="page-subtitle">Complete chronological history of ultrasonic sensor telemetry</p>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="table-controls">
        <input
          type="text"
          className="form-input search-input"
          placeholder="🔍 Search history by percentage, distance, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="log-count-badge">Total Readings: {filteredLogs.length}</span>
      </div>

      <div className="history-table-card">
        <div className="table-container">
          <table className="water-data-table">
            <thead>
              <tr>
                <th>Timestamp / Time</th>
                <th>Distance (cm)</th>
                <th>Water Level (%)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const timeStr = log.created_at
                  ? new Date(log.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })
                  : '—';

                const distance = Number(log.measured_distance_cm || 0).toFixed(1);
                const percentage = Number(log.water_level_percentage || 0).toFixed(1);
                const statusInfo = getStatusFromDistance(distance, percentage);

                return (
                  <tr key={log.id} className="table-row">
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
                    <td className="action-col">
                      <button
                        className="btn-delete-icon"
                        onClick={() => handleDelete(log.id)}
                        title="Delete reading"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-table-msg">
                    No matching water level readings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WaterLogs;
