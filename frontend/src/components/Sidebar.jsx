import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../services/api';

const Sidebar = ({ user, onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        await API.get('/');
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard',     path: '/',              icon: '📊', badge: 'Live' },
    { label: 'Water Logs',    path: '/water-logs',    icon: '📋' },
    { label: 'Device Status', path: '/device-status', icon: '📡' },
    { label: 'Settings',      path: '/settings',      icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">💧</div>
        <div className="brand-text">
          <span className="brand-title">WaterWatch</span>
          <span className="brand-subtitle">IoT Control Center</span>
        </div>
      </div>

      {/* Dynamic Server Connection Indicator */}
      <div className="sidebar-status-box">
        <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
        <span className={`status-text ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? 'Server Connected' : 'Server Disconnected'}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <p className="nav-group-label">MAIN MENU</p>
        <ul className="sidebar-links">
          {navItems.map(({ label, path, icon, badge }) => {
            const isActive = pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{icon}</span>
                  <span className="sidebar-label">{label}</span>
                  {badge && <span className="sidebar-badge">{badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Profile */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">👤</div>
            <div className="user-info">
              <span className="user-name">{user.username || 'Admin'}</span>
              <span className="user-role">System Admin</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
            🚪 Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
