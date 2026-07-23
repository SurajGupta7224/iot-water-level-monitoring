import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authAPI.login({ username, password });
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        if (onLoginSuccess) onLoginSuccess(res.user);
        navigate('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        {/* Header */}
        <div className="login-box-header">
          <div className="login-box-icon">💧</div>
          <h1 className="login-box-title">WaterWatch IoT</h1>
          <p className="login-box-subtitle">Sign in to Admin Dashboard</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="demo-credentials-box">
          <div className="demo-cred-header">
            <span>🔑 Default Admin Credentials</span>
            <button type="button" className="btn-quick-fill" onClick={handleQuickFill}>
              Auto Fill
            </button>
          </div>
          <div className="demo-cred-details">
            <div>Username: <code>admin</code></div>
            <div>Password: <code>admin123</code></div>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-box-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input login-input"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input login-input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? '⏳ Signing in…' : '🔐 Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
