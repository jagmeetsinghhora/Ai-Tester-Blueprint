import React from 'react';
import { Download, Bug, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const ResultsDashboard = ({ data }) => {
  if (!data || !data.results) return null;

  const { results, artifacts, targetUrl, jiraBug } = data;
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = total - passed;
  const rate = Math.round((passed / total) * 100);

  return (
    <div className="results-dashboard">
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <h3>Total Tests</h3>
          <p>{total}</p>
        </div>
        <div className="glass-panel kpi-card">
          <h3>Passed</h3>
          <p style={{ color: 'var(--pass)' }}>{passed}</p>
        </div>
        <div className="glass-panel kpi-card">
          <h3>Failed</h3>
          <p style={{ color: 'var(--fail)' }}>{failed}</p>
        </div>
        <div className="glass-panel kpi-card">
          <h3>Pass Rate</h3>
          <p>{rate}%</p>
        </div>
      </div>

      {jiraBug && (
        <div className="jira-banner">
          <div>
            <h4><Bug size={18} className="text-accent" /> JIRA Bug Auto-Created via MCP</h4>
            <p>{jiraBug.summary}</p>
          </div>
          <a href={jiraBug.url} target="_blank" rel="noreferrer" className="glass-btn primary outline">
            View Issue {jiraBug.key} <ExternalLink size={16} />
          </a>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Scenario Title</th>
              <th>Expected Output</th>
              <th>Actual Output</th>
              <th>Status</th>
              <th>Artifact</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className={r.status === 'PASS' ? 'pass-row' : 'fail-row'}>
                <td>
                  <strong>{r.testId}</strong><br/>
                  <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Score: {r.rice.score}</span>
                </td>
                <td>{r.title}</td>
                <td style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>{r.expected}</td>
                <td style={{ 
                  color: r.status === 'PASS' ? 'var(--text-main)' : 'var(--fail)',
                  fontWeight: r.status === 'FAIL' ? '600' : '400'
                }}>
                  {r.actual}
                </td>
                <td>
                  <span className={`pill ${r.status?.toLowerCase()}`}>
                    {r.status === 'PASS' ? <CheckCircle size={14} style={{marginRight: '4px', verticalAlign: 'middle'}}/> : <XCircle size={14} style={{marginRight: '4px', verticalAlign: 'middle'}}/>}
                    {r.status}
                  </span>
                </td>
                <td>
                  <a href={`http://localhost:4000/api/artifacts/screenshots/${r.screenshot}`} target="_blank" rel="noreferrer" className="action-link">
                    📸 View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="artifact-actions" style={{ marginTop: '2rem' }}>
        <a href={`http://localhost:4000/api/artifacts/${artifacts.excel}`} download className="glass-btn outline">
          <Download size={18} /> Download Excel Log
        </a>
        <a href={`http://localhost:4000/api/artifacts/${artifacts.html}`} download className="glass-btn outline">
          <Download size={18} /> Download HTML Report
        </a>
      </div>
    </div>
  );
};

export default ResultsDashboard;
