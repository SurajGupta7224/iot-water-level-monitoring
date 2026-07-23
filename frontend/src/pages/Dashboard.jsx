import { useEffect, useState, useCallback } from 'react';
import WaterCard from '../components/WaterCard';
import WaterProgress, { getTankStatus } from '../components/WaterProgress';
import PumpStatus from '../components/PumpStatus';
import { waterAPI, settingsAPI, deviceStatusAPI } from '../services/api';

const Dashboard = () => {
  const [latestLog, setLatestLog]         = useState(null);
  const [settings, setSettings]           = useState(null);
  const [deviceStatus, setDeviceStatus]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [togglingPump, setTogglingPump]   = useState(false);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [waterRes, settingsRes, deviceRes] = await Promise.all([
        waterAPI.getLatest(),
        settingsAPI.get(),
        deviceStatusAPI.get(),
      ]);

      if (waterRes?.data) setLatestLog(waterRes.data);
      if (settingsRes?.data) setSettings(settingsRes.data);

      const devices = deviceRes?.data || [];
      if (devices.length > 0) {
        setDeviceStatus(devices[0]);
      } else {
        setDeviceStatus(null);
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // 🔁 Auto-refresh every 3 seconds
    const timer = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // Handle Dynamic Pump Toggle -> Persists to MySQL
  const handlePumpToggle = async () => {
    if (togglingPump) return;
    setTogglingPump(true);
    try {
      const currentPumpState = latestLog?.pump_status === 'ON';
      const newPumpState = currentPumpState ? 'OFF' : 'ON';

      const currentPercentage = latestLog?.water_level_percentage ?? 45.0;
      const currentDistance   = latestLog?.measured_distance_cm ?? 55.0;
      const currentLiters     = latestLog?.current_water_liters ?? 450.0;
      const currentStatus     = latestLog?.tank_status || getTankStatus(currentPercentage).label;

      const res = await waterAPI.create({
        water_level_percentage: currentPercentage,
        current_water_liters: currentLiters,
        measured_distance_cm: currentDistance,
        tank_status: currentStatus,
        pump_status: newPumpState,
      });

      if (res.success && res.data) {
        setLatestLog(res.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      alert(`Failed to update pump state: ${err.message}`);
    } finally {
      setTogglingPump(false);
    }
  };

  // Dynamic Telemetry Values from MySQL
  const percentage       = latestLog?.water_level_percentage ?? 0;
  const tankCapacity     = settings?.tank_capacity_liters ?? 1000;
  const currentLiters    = latestLog?.current_water_liters ?? ((percentage / 100) * tankCapacity).toFixed(1);
  const measuredDistance = latestLog?.measured_distance_cm ?? '—';
  const tankStatusText   = latestLog?.tank_status || getTankStatus(percentage).label;
  const tankStatusInfo   = getTankStatus(percentage);
  const isPumpOn         = latestLog?.pump_status === 'ON';
  
  // Hardware is ONLY online if it sent a heartbeat within the last 20 seconds
  const isDeviceOnline   = deviceStatus?.device_status === 'ONLINE' && deviceStatus?.last_seen && (new Date() - new Date(deviceStatus.last_seen)) < 20000;
  const formattedTime    = latestLog?.created_at ? new Date(latestLog.created_at).toLocaleTimeString() : (lastUpdated ? lastUpdated.toLocaleTimeString() : '—');

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner"></div>
        <p>Loading real-time telemetry from MySQL…</p>
      </div>
    );
  }

  return (
    <div className="page dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Water Monitoring Dashboard</h1>
          <p className="page-subtitle">Dynamic IoT Telemetry & Automatic MySQL Sync</p>
        </div>

        <div className="header-actions">
          <div className="live-pill">
            <span className="live-dot"></span>
            <span>Auto Refresh: 3s</span>
          </div>
          <button id="manual-refresh-btn" className="btn-refresh" onClick={fetchDashboardData}>
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ Backend Connection Error: {error}</div>}

      {/* Grid of Dynamic Telemetry Cards */}
      <div className="cards-grid">
        <WaterCard
          title="Water Level %"
          value={`${Number(percentage).toFixed(1)}%`}
          icon="💧"
          color={tankStatusInfo.color}
        />
        <WaterCard
          title="Tank Status"
          value={tankStatusText}
          icon={tankStatusInfo.icon}
          color={tankStatusInfo.color}
        />
        <WaterCard
          title="Pump Status"
          value={isPumpOn ? 'ON' : 'OFF'}
          icon={isPumpOn ? '⚡' : '⏸️'}
          color={isPumpOn ? '#10b981' : '#ef4444'}
        />
        <WaterCard
          title="Tank Capacity"
          value={tankCapacity}
          unit="Liters"
          icon="🛢️"
          color="#3b82f6"
        />
        <WaterCard
          title="Current Water"
          value={currentLiters}
          unit="Liters"
          icon="🌊"
          color="#06b6d4"
        />
        <WaterCard
          title="Distance (HC-SR04)"
          value={measuredDistance}
          unit="cm"
          icon="📏"
          color="#8b5cf6"
        />
        <WaterCard
          title="Device Status"
          value={isDeviceOnline ? 'Online' : 'Offline'}
          icon={isDeviceOnline ? '📡' : '⚠️'}
          color={isDeviceOnline ? '#10b981' : '#ef4444'}
        />
        <WaterCard
          title="Last Updated"
          value={formattedTime}
          icon="🕒"
          color="#64748b"
        />
      </div>

      {/* Dynamic Animated Tank & Pump Control */}
      <div className="dashboard-main">
        <WaterProgress level={percentage} />
        <PumpStatus
          isOn={isPumpOn}
          onToggle={handlePumpToggle}
          lastUpdated={latestLog?.created_at || lastUpdated}
        />
      </div>
    </div>
  );
};

export default Dashboard;
