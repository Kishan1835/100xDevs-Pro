import React, { useEffect, useState } from 'react';
import { fetchComplaints } from '../../services/api';
import StatCard from '../../components/cards/StatCard';

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchComplaints();
      setComplaints(data);
      setLoading(false);
    };
    load();
  }, []);

  const totals = {
    raised: complaints.reduce((s, c) => s + c.issueRaised, 0),
    inProgress: complaints.reduce((s, c) => s + c.inProgress, 0),
    solved: complaints.reduce((s, c) => s + c.solved, 0)
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Complaints</h1>
      </div>

      <div className="stats-grid">
        <StatCard title="Raised" value={totals.raised} icon="📝" color="orange" />
        <StatCard title="In Progress" value={totals.inProgress} icon="🔄" color="blue" />
        <StatCard title="Solved" value={totals.solved} icon="✅" color="green" />
        <StatCard title="Technicians" value={423} icon="🧑‍🔧" color="purple" />
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Branch-level Complaints</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Issue Raised</th>
                <th>In Progress</th>
                <th>Solved</th>
                <th>Highest Severity</th>
                <th>ITI Score</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td>{c.branchName}</td>
                  <td>{c.issueRaised}</td>
                  <td>{c.inProgress}</td>
                  <td>{c.solved}</td>
                  <td><span className={`severity-badge severity-${c.severity.toLowerCase()}`}>{c.severity}</span></td>
                  <td>
                    <div className="score-display">
                      <span className="score-value">{c.itiScore}</span>
                      <div className="score-bar"><div className="score-fill" style={{ width: `${(c.itiScore/10)*100}%` }}></div></div>
                    </div>
                  </td>
                  <td>{new Date(c.lastUpdated).toLocaleDateString()}</td>
                  <td><a className="btn btn-sm btn-outline">View More</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
