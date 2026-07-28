import { useEffect, useState, useCallback } from 'react';
import WaterCard from '../components/WaterCard';
import WaterTank, { getStatusFromDistance } from '../components/WaterTank';
import WaterChart from '../components/WaterChart';
import WaterHistoryTable from '../components/WaterHistoryTable';
import { waterAPI } from '../services/api';

const Dashboard = () => {
  const [latestLog, setLatestLog]   = useState(null);
  const [allLogs, setAllLogs]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [latestRes, allRes] = await Promise.all([
        waterAPI.getLatest(),
        waterAPI.getAll(),
      ]);

      if (latestRes?.data) setLatestLog(latestRes.data);
      if (allRes?.data) setAllLogs(allRes.data);

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
    // Silent background telemetry polling every 3s
    const timer = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // Derived telemetry metrics directly from database
  const percentage = latestLog ? Number(latestLog.water_level_percentage) : null;
  const distanceCm = latestLog ? Number(latestLog.measured_distance_cm) : null;
  const statusInfo = getStatusFromDistance(distanceCm, percentage);

  const formattedLastUpdated = latestLog?.created_at
    ? new Date(latestLog.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'No Data';

  if (loading) {
    return (
      <div className="page-center-loader">
        <div className="water-ripple-spinner"></div>
        <p className="loader-text">Loading IoT Water Telemetry…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {error && (
        <div className="error-banner">
          ⚠️ Connection Warning: {error}
        </div>
      )}

      {/* TOP STATISTICS CARDS (4 CARDS ONLY) */}
      <div className="top-stats-grid">
        {/* Card 1: Water Level */}
        <WaterCard
          title="Water Level"
          value={percentage !== null ? `${percentage.toFixed(1)}%` : '—'}
          icon="💧"
          color="#3b82f6"
        />

        {/* Card 2: Distance */}
        <WaterCard
          title="Distance"
          value={distanceCm !== null ? `${distanceCm.toFixed(1)}` : '—'}
          unit={distanceCm !== null ? 'cm' : ''}
          icon="📡"
          color="#8b5cf6"
        />

        {/* Card 3: Current Status */}
        <WaterCard
          title="Current Status"
          icon="📊"
          color={statusInfo.color}
          statusBadge={statusInfo}
        />

        {/* Card 4: Last Updated */}
        <WaterCard
          title="Last Updated"
          value={formattedLastUpdated}
          icon="🕒"
          color="#06b6d4"
        />
      </div>


      {/* MAIN CONTENT: Animated Water Tank & Status Highlights */}
      <section className="main-tank-section">
        <WaterTank percentage={percentage} distanceCm={distanceCm} />
      </section>

      {/* WATER LEVEL HISTORY CHART */}
      <section className="history-chart-section">
        <WaterChart logs={allLogs} />
      </section>

      {/* HISTORY TABLE */}
      <section className="history-table-section">
        <WaterHistoryTable logs={allLogs} />
      </section>
    </div>
  );
};

export default Dashboard;
