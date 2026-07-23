import { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    tank_height_cm: '100',
    tank_capacity_liters: '1000',
    minimum_water_level_percentage: '20',
    maximum_water_level_percentage: '90',
    auto_pump: false,
    wifi_ssid: '',
    wifi_password: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get();
      if (res?.data) {
        setForm((prev) => ({
          ...prev,
          username: res.data.username || '',
          tank_height_cm: res.data.tank_height_cm ?? '100',
          tank_capacity_liters: res.data.tank_capacity_liters ?? '1000',
          minimum_water_level_percentage: res.data.minimum_water_level_percentage ?? '20',
          maximum_water_level_percentage: res.data.maximum_water_level_percentage ?? '90',
          auto_pump: Boolean(res.data.auto_pump),
          wifi_ssid: res.data.wifi_ssid || '',
          wifi_password: res.data.wifi_password || '',
          password: '', // keep blank for security
        }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to load settings: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await settingsAPI.update(form);
      if (res.success) {
        setMessage({ type: 'success', text: '✅ Settings & credentials saved successfully to MySQL!' });
        setForm((prev) => ({ ...prev, password: '' })); // clear password input after save
      } else {
        setMessage({ type: 'error', text: `❌ ${res.message}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner"></div>
        <p>Loading configuration settings…</p>
      </div>
    );
  }

  return (
    <div className="page settings">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ System & ESP8266 Settings</h1>
          <p className="page-subtitle">Manage tank dimensions, automation thresholds, WiFi, and Admin credentials.</p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form className="settings-form" onSubmit={handleSave}>
        {/* Section 1: Admin Credentials */}
        <div className="settings-section">
          <h3 className="section-heading">🔐 Admin Credentials</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                value={form.username}
                onChange={handleChange}
                placeholder="Admin Username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password (Leave blank to keep unchanged)</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                placeholder="New Password"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tank Specifications */}
        <div className="settings-section">
          <h3 className="section-heading">🛢️ Tank Specifications</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="tank_height_cm">Tank Height (cm)</label>
              <input
                id="tank_height_cm"
                name="tank_height_cm"
                type="number"
                step="0.1"
                className="form-input"
                value={form.tank_height_cm}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tank_capacity_liters">Tank Capacity (Liters)</label>
              <input
                id="tank_capacity_liters"
                name="tank_capacity_liters"
                type="number"
                step="1"
                className="form-input"
                value={form.tank_capacity_liters}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Water Level Automation Thresholds */}
        <div className="settings-section">
          <h3 className="section-heading">⚡ Thresholds & Pump Automation</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="minimum_water_level_percentage">Minimum Water Level % (Pump ON Trigger)</label>
              <input
                id="minimum_water_level_percentage"
                name="minimum_water_level_percentage"
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={form.minimum_water_level_percentage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="maximum_water_level_percentage">Maximum Water Level % (Pump OFF Trigger)</label>
              <input
                id="maximum_water_level_percentage"
                name="maximum_water_level_percentage"
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={form.maximum_water_level_percentage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="form-label" htmlFor="auto_pump">Auto Pump Automation</label>
              <label className="switch-label">
                <input
                  id="auto_pump"
                  name="auto_pump"
                  type="checkbox"
                  checked={form.auto_pump}
                  onChange={handleChange}
                />
                <span className="switch-slider"></span>
                <span className="switch-text">{form.auto_pump ? 'ENABLED' : 'DISABLED'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: WiFi Credentials for ESP8266 */}
        <div className="settings-section">
          <h3 className="section-heading">📡 ESP8266 WiFi Credentials</h3>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="wifi_ssid">WiFi SSID</label>
              <input
                id="wifi_ssid"
                name="wifi_ssid"
                type="text"
                className="form-input"
                value={form.wifi_ssid}
                onChange={handleChange}
                placeholder="WiFi Network Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="wifi_password">WiFi Password</label>
              <input
                id="wifi_password"
                name="wifi_password"
                type="password"
                className="form-input"
                value={form.wifi_password}
                onChange={handleChange}
                placeholder="WiFi Password"
              />
            </div>
          </div>
        </div>

        <button
          id="save-all-settings-btn"
          type="submit"
          className="btn-primary btn-save-settings"
          disabled={saving}
        >
          {saving ? '⏳ Saving to MySQL…' : '💾 Save All Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
