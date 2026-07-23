import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import WaterLogs from './pages/WaterLogs';
import DeviceStatus from './pages/DeviceStatus';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { authAPI } from './services/api';
import './index.css';

function App() {
  const [user, setUser]         = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="page-center">
        <div className="spinner"></div>
        <p>Authenticating…</p>
      </div>
    );
  }

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <div className={`app-layout ${isAuthenticated ? 'has-sidebar' : ''}`}>
        {isAuthenticated && <Sidebar user={user} onLogout={() => setUser(null)} />}
        <div className="content-wrapper">
          {isAuthenticated && <Topbar user={user} onLogout={() => setUser(null)} />}
          <main className="main-content">
            <Routes>
              <Route
                path="/login"
                element={
                  !isAuthenticated ? (
                    <Login onLoginSuccess={(userData) => setUser(userData)} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/water-logs"
                element={
                  isAuthenticated ? (
                    <WaterLogs />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/device-status"
                element={
                  isAuthenticated ? (
                    <DeviceStatus />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/settings"
                element={
                  isAuthenticated ? (
                    <Settings />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
