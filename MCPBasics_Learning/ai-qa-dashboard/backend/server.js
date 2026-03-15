const express = require('express');
const cors = require('cors');
const path = require('path');
const { runAgent } = require('./src/agentRunner');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve generated artifacts securely
app.use('/api/artifacts', express.static(path.join(__dirname, 'artifacts')));

app.post('/api/run-tests', async (req, res) => {
    const { targetUrl, environment } = req.body;
    
    if (!targetUrl) {
        return res.status(400).json({ error: 'targetUrl is required.' });
    }

    try {
        console.log(`🚀 Starting Playwright QA Agent for ${targetUrl} [${environment}]...`);
        const result = await runAgent(targetUrl, environment);
        
        // Simulating the JIRA Bug Creation response for the frontend (since JIRA MCP requires the local Atlassian configuration)
        const jiraBug = {
            id: '10033',
            key: 'KAN-2',
            url: 'https://jagmeetsingh0106007-1773566139171.atlassian.net/browse/KAN-2',
            summary: 'TC-005: Login fails when multilingual credentials are used'
        };

        res.json({
            ...result,
            jiraBug
        });
        console.log(`✅ Completed execution ${result.executionId}.`);
    } catch (error) {
        console.error('❌ Agent Execution Error:', error);
        res.status(500).json({ error: 'Agent execution failed.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 AI QA Agent Backend running on http://localhost:${PORT}`);
});
