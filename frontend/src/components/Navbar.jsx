import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Settings',  path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">💧</span>
        <span className="navbar-title">WaterWatch IoT</span>
      </div>

      <ul className="navbar-links">
        {navItems.map(({ label, path, icon }) => (
          <li key={path}>
            <Link
              to={path}
              className={`navbar-link ${pathname === path ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-right">
        <div className="navbar-status">
          <span className="status-dot online"></span>
          <span className="status-text">Live</span>
        </div>

        {user && (
          <div className="user-badge">
            <span className="user-name">👤 {user.username || 'Admin'}</span>
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
