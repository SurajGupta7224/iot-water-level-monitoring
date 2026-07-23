import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { deviceStatusAPI } from '../services/api';

const Topbar = ({ user, onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime]   = useState(new Date());
  const [deviceStatus, setDeviceStatus] = useState(null);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);

    const checkDevice = async () => {
      try {
        const res = await deviceStatusAPI.get();
        const devices = res?.data || [];
        if (devices.length > 0) {
          setDeviceStatus(devices[0]);
        }
      } catch {
        setDeviceStatus(null);
      }
    };

    checkDevice();
    const deviceTimer = setInterval(checkDevice, 3000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(deviceTimer);
    };
  }, []);

  const isDeviceOnline = deviceStatus?.device_status === 'ONLINE' && deviceStatus?.last_seen && (new Date() - new Date(deviceStatus.last_seen)) < 20000;

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return { title: 'Dashboard', subtitle: 'Live Telemetry & Water Pump Controls' };
      case '/water-logs':
        return { title: 'Water Logs', subtitle: 'Telemetry History & Log Analytics' };
      case '/device-status':
        return { title: 'Device Status', subtitle: 'ESP8266 Microcontroller Hardware Info' };
      case '/settings':
        return { title: 'Settings', subtitle: 'System Configuration & Admin Credentials' };
      default:
        return { title: 'Overview', subtitle: 'Water Monitoring System' };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{title}</h2>
        <span className="topbar-divider">|</span>
        <span className="topbar-subtitle">{subtitle}</span>
      </div>

      <div className="topbar-right">
        {/* Real-time Clock */}
        <div className="topbar-clock">
          <span className="clock-icon">🕒</span>
          <span className="clock-text">{currentTime.toLocaleTimeString()}</span>
        </div>

        {/* Dynamic ESP8266 Live Device Status Indicator */}
        <div className={`topbar-device-pill ${isDeviceOnline ? 'online' : 'offline'}`}>
          <span className={`device-dot ${isDeviceOnline ? 'online' : 'offline'}`}></span>
          <span>{isDeviceOnline ? 'ESP8266 Online' : 'ESP8266 Offline'}</span>
        </div>

        {/* User Badge & Quick Logout */}
        {user && (
          <div className="topbar-user">
            <div className="user-avatar-sm">👤</div>
            <span className="topbar-username">{user.username || 'Admin'}</span>
            <button className="topbar-logout-btn" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
