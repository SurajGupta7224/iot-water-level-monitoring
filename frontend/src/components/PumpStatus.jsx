const PumpStatus = ({ isOn = false, onToggle, lastUpdated }) => {
  return (
    <div className={`pump-card ${isOn ? 'pump-on' : 'pump-off'}`}>
      <div className="pump-header">
        <span className="pump-icon">⚡</span>
        <span className="pump-title">Water Pump</span>
      </div>

      <div className="pump-body">
        <div className={`pump-indicator ${isOn ? 'active' : ''}`}>
          <div className="pump-ring"></div>
          <span className="pump-status-text">{isOn ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      <button
        id="pump-toggle-btn"
        className={`pump-toggle-btn ${isOn ? 'btn-stop' : 'btn-start'}`}
        onClick={onToggle}
      >
        {isOn ? '🛑 Turn Off' : '▶️ Turn On'}
      </button>

      {lastUpdated && (
        <p className="pump-last-updated">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default PumpStatus;
