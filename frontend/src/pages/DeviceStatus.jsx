import { useEffect, useState } from 'react';
import { deviceStatusAPI } from '../services/api';

const DeviceStatus = () => {
  const [devices, setDevices]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editingDevice, setEditingDevice] = useState(null); // holds device object being edited
  const [editForm, setEditForm]     = useState({ device_name: '', device_id: '', firmware_version: '', ip_address: '' });
  const [saving, setSaving]         = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await deviceStatusAPI.get();
      setDevices(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name || 'Device'}' card?`)) return;
    try {
      await deviceStatusAPI.remove(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(`Failed to delete device: ${err.message}`);
    }
  };

  const startEdit = (device) => {
    setEditingDevice(device);
    setEditForm({
      device_name: device.device_name || '',
      device_id: device.device_id || '',
      firmware_version: device.firmware_version || '1.0.0',
      ip_address: device.ip_address || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDevice) return;
    setSaving(true);
    try {
      const res = await deviceStatusAPI.edit(editingDevice.id, editForm);
      if (res.success) {
        setDevices((prev) =>
          prev.map((d) => (d.id === editingDevice.id ? { ...d, ...editForm } : d))
        );
        setEditingDevice(null);
      }
    } catch (err) {
      alert(`Failed to update device: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner"></div>
        <p>Loading IoT hardware device status…</p>
      </div>
    );
  }

  return (
    <div className="page device-status-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📡 IoT Device Telemetry</h1>
          <p className="page-subtitle">Manage ESP8266 / ESP32 Hardware Nodes & Connectivity</p>
        </div>
        <button className="btn-refresh" onClick={fetchDevices}>🔄 Refresh Devices</button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Edit Device Modal Form */}
      {editingDevice && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">✏️ Edit Device Info</h3>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Device Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.device_name}
                  onChange={(e) => setEditForm({ ...editForm, device_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Device ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.device_id}
                  onChange={(e) => setEditForm({ ...editForm, device_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Firmware Version</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.firmware_version}
                  onChange={(e) => setEditForm({ ...editForm, firmware_version: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">IP Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.ip_address}
                  onChange={(e) => setEditForm({ ...editForm, ip_address: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
                <button type="button" className="btn-refresh" onClick={() => setEditingDevice(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Cards Grid */}
      <div className="devices-grid">
        {devices.map((dev) => {
          const isOnline = dev.device_status === 'ONLINE' && dev.last_seen && (new Date() - new Date(dev.last_seen)) < 20000;
          return (
            <div key={dev.id} className="device-card">
              <div className="device-card-header">
                <span className="device-card-icon">📟</span>
                <div>
                  <h3 className="device-card-name">{dev.device_name || 'ESP Node'}</h3>
                  <span className="device-card-id">ID: {dev.device_id}</span>
                </div>
                <span className={`device-status-badge ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="device-card-body">
                <div className="device-info-row">
                  <span className="info-label">🌐 IP Address:</span>
                  <span className="info-value">{dev.ip_address || 'Not assigned'}</span>
                </div>
                <div className="device-info-row">
                  <span className="info-label">📶 WiFi Signal (RSSI):</span>
                  <span className="info-value">{dev.wifi_signal_strength ? `${dev.wifi_signal_strength} dBm` : '—'}</span>
                </div>
                <div className="device-info-row">
                  <span className="info-label">💾 Firmware Version:</span>
                  <span className="info-value">{dev.firmware_version || '1.0.0'}</span>
                </div>
                <div className="device-info-row">
                  <span className="info-label">🕒 Last Seen:</span>
                  <span className="info-value">{dev.last_seen ? new Date(dev.last_seen).toLocaleString() : 'Never'}</span>
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="device-card-footer">
                <button className="btn-edit-card" onClick={() => startEdit(dev)}>
                  ✏️ Edit
                </button>
                <button className="btn-delete-card" onClick={() => handleDelete(dev.id, dev.device_name)}>
                  🗑️ Delete Card
                </button>
              </div>
            </div>
          );
        })}

        {devices.length === 0 && (
          <div className="no-data-card">
            <p>No IoT devices registered in MySQL. When your ESP8266 connects, it will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceStatus;
