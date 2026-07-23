// Function to compute Tank Status based on percentage thresholds:
// 0-20% = Empty
// 21-40% = Low
// 41-80% = Medium
// 81-100% = Full
export const getTankStatus = (percentage) => {
  const p = Math.min(Math.max(Number(percentage) || 0, 0), 100);
  if (p <= 20) return { label: 'Empty', color: '#ef4444', icon: '🔴' };
  if (p <= 40) return { label: 'Low', color: '#f59e0b', icon: '🟡' };
  if (p <= 80) return { label: 'Medium', color: '#3b82f6', icon: '🔵' };
  return { label: 'Full', color: '#10b981', icon: '🟢' };
};

const WaterProgress = ({ level = 0 }) => {
  const percentage = Math.min(Math.max(Number(level) || 0, 0), 100);
  const status = getTankStatus(percentage);

  return (
    <div className="water-progress-wrapper">
      <div className="progress-labels">
        <div className="label-title-group">
          <span className="progress-title">Water Level Progress</span>
          <span className="progress-value-badge">{percentage.toFixed(1)}%</span>
        </div>
        <div className="tank-status-badge" style={{ borderColor: status.color, color: status.color }}>
          <span>{status.icon}</span>
          <span>{status.label}</span>
        </div>
      </div>

      {/* Animated Vertical Water Tank */}
      <div className="tank-container">
        <div className="tank">
          <div
            className="tank-fill animated-water"
            style={{
              height: `${percentage}%`,
              background: `linear-gradient(180deg, ${status.color}dd 0%, ${status.color} 100%)`,
            }}
          >
            <div className="tank-wave"></div>
            <div className="tank-wave wave-sub"></div>
          </div>
        </div>
        <div className="tank-scale">
          {[100, 80, 60, 40, 20, 0].map((mark) => (
            <span key={mark} className="scale-mark">{mark}%</span>
          ))}
        </div>
      </div>

      {/* Horizontal Bar */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill animated-bar"
            style={{ width: `${percentage}%`, background: status.color }}
          />
        </div>
        <span className="progress-value">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default WaterProgress;
