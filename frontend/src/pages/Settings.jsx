import { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const [form, setForm] = useState({
    tank_height_cm: '100',
    sensor_offset_cm: '2.0',
    empty_threshold_cm: '15.0',
    low_threshold_cm: '10.0',
    medium_threshold_cm: '5.0',
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
          tank_height_cm: res.data.tank_height_cm ?? '100',
        }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to load settings: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await settingsAPI.update(form);
      if (res.success) {
        setMessage({ type: 'success', text: '✅ Ultrasonic sensor calibration settings saved successfully!' });
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
      <div className="page-center-loader">
        <div className="water-ripple-spinner"></div>
        <p className="loader-text">Loading Sensor Configuration…</p>
      </div>
    );
  }

  return (
    <div className="settings-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Calibration & Settings</h1>
          <p className="page-subtitle">Configure ultrasonic sensor distance thresholds and tank dimensions</p>
        </div>
      </div>

      {message && (
        <div className={`alert-banner alert-${message.type}`}>{message.text}</div>
      )}

      <form className="settings-glass-form" onSubmit={handleSave}>
        {/* Section 1: Tank & Ultrasonic Sensor Dimensions */}
        <div className="settings-card-section">
          <h3 className="section-title">📡 Ultrasonic Sensor & Tank Specs</h3>
          <div className="form-grid-2">
            <div className="form-field-group">
              <label className="form-field-label" htmlFor="tank_height_cm">Total Tank Height (cm)</label>
              <input
                id="tank_height_cm"
                name="tank_height_cm"
                type="number"
                step="0.1"
                className="form-glass-input"
                value={form.tank_height_cm}
                onChange={handleChange}
                required
              />
              <span className="field-hint">Distance from sensor at top to tank bottom</span>
            </div>

            <div className="form-field-group">
              <label className="form-field-label" htmlFor="sensor_offset_cm">Sensor Blind Zone Offset (cm)</label>
              <input
                id="sensor_offset_cm"
                name="sensor_offset_cm"
                type="number"
                step="0.1"
                className="form-glass-input"
                value={form.sensor_offset_cm}
                onChange={handleChange}
                required
              />
              <span className="field-hint">Minimum clearance between sensor & maximum water</span>
            </div>
          </div>
        </div>

        {/* Section 2: Water Level Distance Thresholds */}
        <div className="settings-card-section">
          <h3 className="section-title">📊 Water Level Distance Thresholds</h3>
          <div className="threshold-info-box">
            <p>The system uses distance measured by HC-SR04 sensor to calculate status:</p>
            <ul>
              <li>🔴 <strong>Empty:</strong> Distance ≥ 15 cm</li>
              <li>🟡 <strong>Low:</strong> Distance 10 cm to 15 cm</li>
              <li>⚪ <strong>Medium:</strong> Distance 5 cm to 10 cm</li>
              <li>🟢 <strong>Full:</strong> Distance &lt; 5 cm</li>
            </ul>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary-glow"
          disabled={saving}
        >
          {saving ? '⏳ Saving Configuration…' : '💾 Save Calibration Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
