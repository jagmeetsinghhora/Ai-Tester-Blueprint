import React, { useState } from 'react';
import axios from 'axios';
import { Play, Activity, ShieldAlert, Cpu } from 'lucide-react';
import ResultsDashboard from './components/ResultsDashboard';

const App = () => {
  const [targetUrl, setTargetUrl] = useState('https://app.vwo.com');
  const [environment, setEnvironment] = useState('staging');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const runAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const { data } = await axios.post('http://localhost:4000/api/run-tests', {
        targetUrl,
        environment
      });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the AI Agent runner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <Cpu className="text-accent" size={28} />
          <span>AI QA <strong>Agent Dashboard</strong></span>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero-section">
          <h1>Autonomous Test Execution</h1>
          <p>Deploy the Playwright MCP agent to instantly execute RICE POT prioritized test cases, capture visual artifacts, and generate defect tickets.</p>
        </div>

        <div className="glass-panel config-panel">
          <form onSubmit={runAgent}>
            <div className="input-group">
              <label>Target URL</label>
              <input 
                type="url" 
                value={targetUrl} 
                onChange={(e) => setTargetUrl(e.target.value)}
                required
                className="glass-input"
              />
            </div>
            <div className="input-group">
              <label>Environment</label>
              <select 
                value={environment} 
                onChange={(e) => setEnvironment(e.target.value)}
                className="glass-input"
              >
                <option value="staging">Staging (Block Real Logins)</option>
                <option value="production">Production</option>
                <option value="local">Local Development</option>
              </select>
            </div>
            <button type="submit" className="glass-btn primary" disabled={loading}>
              {loading ? (
                <><Activity className="spinner" size={18} /> Executing Run...</>
              ) : (
                <><Play size={18} /> Launch Agent</>
              )}
            </button>
          </form>
          {error && <div className="error-banner"><ShieldAlert size={16} /> {error}</div>}
        </div>

        {results && <ResultsDashboard data={results} />}
      </main>
    </div>
  );
};

export default App;
