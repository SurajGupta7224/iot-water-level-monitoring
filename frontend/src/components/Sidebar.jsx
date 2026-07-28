import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Dashboard',           path: '/',           icon: '📊' },
    { label: 'Water Level History', path: '/water-logs', icon: '📈' },
    { label: 'Settings',            path: '/settings',   icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">💧</div>
        <div className="brand-text">
          <span className="brand-title">WaterWatch</span>
          <span className="brand-subtitle">Smart Water Level Monitoring System</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <p className="nav-group-label">MAIN MENU</p>
        <ul className="sidebar-links">
          {navItems.map(({ label, path, icon }) => {
            const isActive = pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{icon}</span>
                  <span className="sidebar-label">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

