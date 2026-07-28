import { useState, useEffect } from 'react';

const Topbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formatTimeWithAMPM = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">Smart Water Level Monitoring Dashboard</h2>
        <span className="topbar-divider">|</span>
        <span className="topbar-subtitle">Real-Time IoT Water Level Monitoring System</span>
      </div>

      <div className="topbar-right">
        {/* Real-time Clock in Top-Right */}
        <div className="topbar-clock">
          <span className="clock-icon">🕒</span>
          <span className="clock-text">{formatTimeWithAMPM(currentTime)}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

