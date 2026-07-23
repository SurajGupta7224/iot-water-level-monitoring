import { useEffect, useState } from 'react';
import { waterAPI } from '../services/api';

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
    if (!window.confirm('Are you sure you want to delete this log reading?')) return;
    try {
      await waterAPI.remove(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      alert(`Failed to delete log: ${err.message}`);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      (log.tank_status && log.tank_status.toLowerCase().includes(term)) ||
      (log.pump_status && log.pump_status.toLowerCase().includes(term)) ||
      (log.water_level_percentage && String(log.water_level_percentage).includes(term))
    );
  });

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner"></div>
        <p>Loading historical water logs…</p>
      </div>
    );
  }

  return (
    <div className="page water-logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Water Telemetry Logs</h1>
          <p className="page-subtitle">Historical sensor readings & water level telemetry</p>
        </div>
        <button className="btn-refresh" onClick={fetchLogs}>🔄 Refresh Logs</button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="table-controls">
        <input
          type="text"
          className="form-input search-input"
          placeholder="🔍 Search by percentage, status, or pump state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="log-count-badge">Total Logs: {filteredLogs.length}</span>
      </div>

      <div className="history-section">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Water Level %</th>
                <th>Current Volume</th>
                <th>Distance (cm)</th>
                <th>Tank Status</th>
                <th>Pump State</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td>
                    <span className="level-badge">{Number(log.water_level_percentage).toFixed(1)}%</span>
                  </td>
                  <td>{log.current_water_liters ? `${log.current_water_liters} L` : '—'}</td>
                  <td>{log.measured_distance_cm ? `${log.measured_distance_cm} cm` : '—'}</td>
                  <td>
                    <span className={`status-pill ${log.tank_status ? log.tank_status.toLowerCase() : 'normal'}`}>
                      {log.tank_status || 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <span className={`pump-badge ${log.pump_status === 'ON' ? 'pump-on-badge' : 'pump-off-badge'}`}>
                      {log.pump_status || 'OFF'}
                    </span>
                  </td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-delete-log"
                      onClick={() => handleDelete(log.id)}
                      title="Delete Log"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="no-data">No matching water log records found.</td>
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
