import { useState, useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = "http://localhost:3001";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeverityStyle(sev, isDark) {
  if (isDark) {
    return {
      Critical: { bg: "#3A0000", color: "#FF6B6B" },
      High: { bg: "#362200", color: "#FCA43B" },
      Medium: { bg: "#001A36", color: "#4B9DF5" },
      Low: { bg: "#0B2600", color: "#7DCF46" },
    }[sev] || { bg: "#222", color: "#AAA" };
  }
  return {
    Critical: { bg: "#FCEBEB", color: "#A32D2D" },
    High: { bg: "#FAEEDA", color: "#854F0B" },
    Medium: { bg: "#E6F1FB", color: "#185FA5" },
    Low: { bg: "#EAF3DE", color: "#3B6D11" },
  }[sev] || { bg: "#F1EFE8", color: "#5F5E5A" };
}

function getCategoryStyle(cat, isDark) {
  if (isDark) {
    return {
      Frontend: { bg: "#1A173B", color: "#9A8FFF" },
      Backend: { bg: "#00291D", color: "#3ACD98" },
      UI: { bg: "#3A0B1A", color: "#FF739D" },
    }[cat] || { bg: "#222", color: "#AAA" };
  }
  return {
    Frontend: { bg: "#EEEDFE", color: "#534AB7" },
    Backend: { bg: "#E1F5EE", color: "#0F6E56" },
    UI: { bg: "#FBEAF0", color: "#993556" },
  }[cat] || { bg: "#F1EFE8", color: "#5F5E5A" };
}

function getLoadColor(load) {
  if (load >= 8) return "#E24B4A"; // block assignment
  if (load >= 6) return "#BA7517"; // warn
  return "#639922"; // good
}

const timeAgo = (dateStr) => {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / (1000 * 60 * 60));
  if (h === 0) return "Just now";
  if (h < 24) return `${h} hours ago`;
  const d = Math.floor(h / 24);
  return `${d} days ago`;
};

const triggerDesktopNotification = (title, body) => {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") new Notification(title, { body });
      });
    }
  }
};

// ─── Backend API ──────────────────────────────────────────────────────────────

async function fetchJiraBugs() {
  const res = await fetch(`${BACKEND_URL}/api/bugs`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return res.json();
}

async function fetchJiraProjectMembers() {
  const res = await fetch(`${BACKEND_URL}/api/developers`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return res.json();
}

async function assignJiraIssue(issueKey, accountId, commentBody, assigneeName, assignedBy) {
  const res = await fetch(`${BACKEND_URL}/api/assign/${issueKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId, commentBody, assigneeName, assignedBy }),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return res.json();
}

async function classifyBugWithAI(bug) {
  const res = await fetch(`${BACKEND_URL}/api/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bug),
  });
  if (!res.ok) throw new Error(`Backend classification error: ${res.status}`);
  return res.json();
}

// ─── Assignment Logic ─────────────────────────────────────────────────────────

function findBestDeveloper(classification, developers) {
  let pool = developers.filter((d) => d.available && d.load < 8);
  if (pool.length === 0) return null; // blocked - overload

  const checkMatch = (d, str) => (d.name?.toLowerCase().includes(str) || d.role?.toLowerCase().includes(str));

  let roleMatch = [];
  if (classification.category === "Frontend") {
    roleMatch = pool.filter(d => checkMatch(d, "frontend"));
  } else if (classification.category === "Backend") {
    roleMatch = pool.filter(d => checkMatch(d, "backend"));
  }

  const sortLowestLoad = (arr) => arr.sort((a,b) => a.load - b.load);
  
  if (roleMatch.length > 0) {
    return sortLowestLoad(roleMatch)[0];
  } else {
    return sortLowestLoad(pool)[0];
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, color, isDark }) {
  return (
    <div style={{ background: isDark ? "#1E1E1E" : "#f7f7f5", border: isDark ? "0.5px solid #333" : "none", borderRadius: 8, padding: "12px 16px" }}>
      <div style={{ fontSize: 11, color: isDark ? "#AAA" : "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: color ? color : isDark ? "#FFF" : "#111" }}>{value ?? "—"}</div>
    </div>
  );
}

function DevCard({ dev, isDark }) {
  const pct = Math.round((dev.load / 8) * 100);
  const color = getLoadColor(dev.load);
  const isOverload = dev.load >= 6;
  const isBlocked = dev.load >= 8;

  return (
    <div style={{ background: isDark ? "#1E1E1E" : "#fff", border: `0.5px solid ${isDark ? "#333" : "#e5e5e5"}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDark ? "#333" : "#EEEDFE", color: isDark ? "#CCC" : "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
          {dev.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: isDark ? "#FFF" : "#111", display: "flex", alignItems: "center", gap: 6 }}>
            {dev.name} {isBlocked && <span title="Max Load Hit" style={{ color: "#E24B4A" }}>⚠</span>}
          </div>
          <div style={{ fontSize: 10, color: isDark ? "#888" : "#888", display: "flex", gap: 4, alignItems: "center" }}>
             <span style={{ border: `1px solid ${isDark ? "#444" : "#ccc"}`, padding: "1px 4px", borderRadius: 2 }}>{dev.role}</span>
             {dev.load > 0 && <span>• Est. res: {dev.load * 2}h</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 4, background: isDark ? "#333" : "#eee", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
        </div>
        <span style={{ fontSize: 10, color: isOverload ? color : (isDark ? "#888" : "#888"), whiteSpace: "nowrap", fontWeight: isOverload ? 600 : 400 }}>{dev.load}/8</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartBugTriage() {
  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true); // show skeleton initially
  const [classifying, setClassifying] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  
  // Enterprise Dashboard States
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDev, setFilterDev] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const fetchInProgress = useRef(false);

  // ── Keyboard Shortcuts (Improvement 10) ───────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT") return;
      if (e.key.toLowerCase() === 'a' && selectedId) {
        // Mock keyboard action handler trigger
        setNotification(`Keyboard Accept Triggered for ${selectedId}`);
        setTimeout(() => setNotification(null), 3000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  // ── Fetch & Auto-Assign Sync Loop ─────────────────────────────────────────
  const handleFetch = useCallback(async (isPolling = false) => {
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    if (!isPolling && bugs.length === 0) setLoading(true); // only show skeleton on absolute first load
    setError(null);

    try {
      const [fetchedBugs, fetchedDevs] = await Promise.all([
        fetchJiraBugs(),
        fetchJiraProjectMembers(),
      ]);

      setDevelopers(fetchedDevs);
      
      const persistedStr = localStorage.getItem("smarttriage_assignments");
      const persistedState = persistedStr ? JSON.parse(persistedStr) : {};

      const classified = [...fetchedBugs];
      let newAssignments = { ...persistedState };
      let latestNotification = null;
      let newCount = 0;

      for (let i = 0; i < classified.length; i++) {
        const bug = classified[i];
        
        // 1. Jira explicit manual sync respect
        if (bug.currentAssignee) {
           classified[i] = {
             ...bug,
             accepted: true,
             suggestedAssignee: bug.currentAssignee,
             suggestedAccountId: bug.currentAssigneeAccountId,
             manualSync: true
           };
           continue;
        }

        // 2. Restore from persistent state immediately if found!
        if (newAssignments[bug.id]) {
           classified[i] = { ...bug, ...newAssignments[bug.id] };
           continue; 
        }

        // 3. New unassigned bug. Formulate AI / Ruleset!
        try {
          const result = await classifyBugWithAI(bug);
          const bestDev = findBestDeveloper(result, fetchedDevs);

          classified[i] = {
            ...bug,
            cat: result.category,
            sev: result.severity,
            conf: result.confidence,
            skills: result.skills_required || [],
            reasoning: result.reasoning,
            matched_keywords: result.matched_keywords || [],
            suggestedAssignee: bestDev?.name || null,
            suggestedAccountId: bestDev?.accountId || null,
            accepted: !!bestDev, // Autopilot!
          };
          
          if (bestDev) {
            // Autonomous Commit to Jira Endpoint
            const commentBody = `🤖 *Smart Bug Triage Bot — Auto Triage Report*
📋 *Classification*: ${result.category}
• Target Severity: ${result.severity}
• Triggers Hit: ${result.matched_keywords?.join(', ') || 'N/A'}
• Resolution Path: ${bestDev.name}
⚙️ _Method: Live Autonomous Proxy Parsing_`;

            await assignJiraIssue(bug.id, bestDev.accountId, commentBody, bestDev.name, "SmartBugTriage AI Engine");
            
            // Queue Dashboard Notification
            latestNotification = `Auto-Assigned: ${bug.id} → ${bestDev.name}`;
            if (result.severity === "Critical" || result.severity === "Blocker" || result.severity === "High") {
                triggerDesktopNotification(`Urgent Alert: ${bug.id} (${result.severity})`, `Auto-assigned to ${bestDev.name}`);
            }

            newAssignments[bug.id] = {
              cat: result.category, sev: result.severity, conf: result.confidence,
              skills: result.skills_required || [], reasoning: result.reasoning,
              matched_keywords: result.matched_keywords || [],
              suggestedAssignee: bestDev.name, suggestedAccountId: bestDev.accountId, accepted: true
            };
            
            // Update UI internal capacity metric instantaneously
            const devIdx = fetchedDevs.findIndex(d => d.accountId === bestDev.accountId);
            if (devIdx > -1) fetchedDevs[devIdx].load += 1;
            newCount++;
          } else {
            // Overloaded system notification trigger
            if (result.severity === "Critical" || result.severity === "High") {
                triggerDesktopNotification(`URGENT: Blocked Assignment ${bug.id}`, `All developers overloaded! Manual triage required.`);
            }
          }
        } catch (err) {
          console.error("Failed to classify an issue", err);
        }

        localStorage.setItem("smarttriage_assignments", JSON.stringify(newAssignments));
        setBugs([...classified]);
      }

      setBugs([...classified]);
      setLastSynced(new Date());

      if (latestNotification) {
         setNotification(latestNotification);
         if (newCount > 0) confetti({ particleCount: 150, zIndex: 9999 });
         setTimeout(() => setNotification(null), 6000);
      }

    } catch (err) {
      if (!isPolling) setError(err.message);
    } finally {
      setLoading(false);
      setClassifying(false);
      fetchInProgress.current = false;
    }
  }, [bugs.length]);

  // ── Polling Interval Hook ──────────────────────────────────────────────────
  useEffect(() => {
    // initial permissions sync for HTML5 notification support
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
       Notification.requestPermission();
    }
    
    handleFetch(false); // First massive load

    const interval = setInterval(() => {
      handleFetch(true); 
    }, 30000);

    return () => clearInterval(interval);
  }, []); // single initialization

  // ── Exports (Improvement 9) ────────────────────────────────────────────────
  const exportCSV = () => {
    const header = "ID,Generated On,Reporter,Title,Category,Severity,Assignee,Jira Manual Sync\n";
    const rows = bugs.map(b => `${b.id},${new Date(b.created).toISOString()},"${b.reporter}","${b.title.replace(/"/g, '""')}",${b.cat||'—'},${b.sev||'—'},"${b.suggestedAssignee || b.currentAssignee || 'Unassigned'}",${b.manualSync ? 'Yes' : 'No'}`);
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `triage_report_${Date.now()}.csv`; a.click();
  };

  const exportAuditLog = () => {
    fetch(`${BACKEND_URL}/api/audit`)
      .then(res => res.json())
      .then(data => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `audit_trail_${Date.now()}.json`; a.click();
      }).catch(e => alert("Failed to download audit.json log"));
  };

  const exportPDF = () => {
    window.print();
  };


  // ── Derived View / Filtering ──────────────────────────────────────────────
  const filtered = bugs.filter((b) => {
    // 1. Search Query
    if (searchQuery && !(b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    // 2. Dev Filter
    if (filterDev !== "all" && b.suggestedAssignee !== filterDev) return false;
    // 3. Category Filter
    if (filterCat !== "all" && b.cat !== filterCat) return false;
    // 4. Priority Filter
    if (filterPriority !== "all" && b.sev !== filterPriority) return false;
    
    return true;
  }).sort((a, b) => new Date(b.created) - new Date(a.created));

  const selectedBug = bugs.find((b) => b.id === selectedId);
  const totalCriticalHigh = bugs.filter((b) => b.sev === "Critical" || b.sev === "High").length;
  const totalUnassigned = bugs.filter((b) => !b.suggestedAssignee).length;
  const totalTriagedToday = bugs.filter((b) => b.accepted && new Date(b.created).toDateString() === new Date().toDateString()).length;

  const themeCss = {
    bg: isDark ? "#111" : "#fff",
    border: isDark ? "#333" : "#e5e5e5",
    text: isDark ? "#E5E5E5" : "#111",
    muted: isDark ? "#888" : "#888",
    header: isDark ? "#171717" : "#Fcfcfa",
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: themeCss.text, border: `1px solid ${themeCss.border}`, borderRadius: 12, overflow: "hidden", background: themeCss.bg, minHeight: 600, display: "flex", flexDirection: "column" }}>

      {/* Notifications */}
      {notification && (
        <div style={{ position: "absolute", top: 20, right: 20, background: isDark ? "#0B2600" : "#EAF3DE", color: isDark ? "#7DCF46" : "#3B6D11", border: `1px solid ${isDark ? "#7DCF46" : "#3B6D11"}`, padding: "12px 20px", borderRadius: 8, zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8, fontWeight: 500, animation: "fadeIn 0.3s ease-out" }}>
          ✨ {notification}
        </div>
      )}

      {/* Enterprise Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: themeCss.header, borderBottom: `1px solid ${themeCss.border}` }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Smart Bug Triage <span style={{color: "#185FA5"}}>.APP</span></span>
            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: isDark ? "#1A173B" : "#EEEDFE", color: isDark ? "#9A8FFF" : "#534AB7", fontWeight: 600 }}>PRODUCTION LIVE</span>
          </div>
          <div style={{ fontSize: 11, color: themeCss.muted, marginTop: 4 }}>
            Event Stream Active {lastSynced && ` • Last synced ${Math.floor((new Date() - lastSynced) / 1000)}s ago`} 
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setIsDark(!isDark)} style={{ background: isDark ? "#333" : "#eee", color: themeCss.text, border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>{isDark ? "☀ Light" : "🌙 Dark"}</button>
          <button onClick={exportCSV} style={{ background: "#EEEDFE", color: "#534AB7", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Export CSV</button>
          <button onClick={exportPDF} style={{ background: "#FCEBEB", color: "#A32D2D", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Print PDF</button>
          <button onClick={exportAuditLog} style={{ background: "#185FA5", color: "#FFF", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Audit.json</button>
        </div>
      </div>

      {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", fontSize: 12, padding: "8px 20px", borderBottom: `1px solid ${themeCss.border}` }}>⚠ {error}</div>}

      {/* Metrics Dash */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "12px 20px", borderBottom: `1px solid ${themeCss.border}` }}>
        <MetricCard label="Total Live Bugs" value={bugs.length || "0"} isDark={isDark} />
        <MetricCard label="Triaged Today" value={totalTriagedToday} color="#639922" isDark={isDark} />
        <MetricCard label="Urgent (High/Crit)" value={totalCriticalHigh} color="#A32D2D" isDark={isDark} />
        <MetricCard label="Unassigned Fallbacks" value={totalUnassigned} color="#BA7517" isDark={isDark} />
      </div>

      {/* Advanced Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderBottom: `1px solid ${themeCss.border}`, flexWrap: "wrap", background: isDark ? "#171717" : "#Fafafa" }}>
        <input 
          type="text" 
          placeholder="Search issue ID or keyword..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${themeCss.border}`, background: themeCss.bg, color: themeCss.text, flex: 1, minWidth: 200 }}
        />
        
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${themeCss.border}`, background: themeCss.bg, color: themeCss.text }}>
          <option value="all">Category: All</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="UI">UI</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${themeCss.border}`, background: themeCss.bg, color: themeCss.text }}>
          <option value="all">Priority: All</option>
          <option value="Critical">Critical & Blocker</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Main Panel View */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", flex: 1, overflow: "hidden" }}>

        {/* List View */}
        <div style={{ borderRight: `1px solid ${themeCss.border}`, overflowY: "auto" }}>
          {loading && (
             <div style={{ padding: "4rem 2rem", display: "flex", flexDirection: "column", gap: 14 }}>
               {[1,2,3,4,5].map(i => (
                 <div key={i} style={{ height: 40, background: isDark ? "#222" : "#f5f5f5", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
               ))}
             </div>
          )}
          {!loading && filtered.length === 0 && (
             <div style={{ padding: "4rem 2rem", textAlign: "center", color: themeCss.muted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                No bugs match these filters! Inbox Zero.
             </div>
          )}
          {!loading && filtered.map((bug) => {
            const assignee = bug.suggestedAssignee;
            const s = getSeverityStyle(bug.sev, isDark);
            const c = getCategoryStyle(bug.cat, isDark);

            return (
              <div
                key={bug.id}
                onClick={() => setSelectedId(bug.id)}
                style={{
                  padding: "14px 20px", borderBottom: `1px solid ${themeCss.border}`, cursor: "pointer",
                  background: selectedId === bug.id ? (isDark ? "#1E2A3B" : "#EEF4FD") : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: themeCss.muted, fontFamily: "monospace" }}>{bug.id}</span>
                  <span style={{ fontSize: 13, color: themeCss.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bug.title}</span>
                  {bug.sev && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: s.bg, color: s.color }}>{bug.sev}</span>}
                  {bug.cat && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: c.bg, color: c.color }}>{bug.cat}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: themeCss.muted, flex: 1 }}>
                    {bug.manualSync ? (
                      <span style={{ color: isDark ? "#7DCF46" : "#4A7C15", fontWeight: 500 }}>✓ Jira Manual Sync: {assignee}</span>
                    ) : bug.accepted ? (
                      <span style={{ color: isDark ? "#4B9DF5" : "#185FA5", fontWeight: 500 }}>✓ Auto-Assigned to {assignee}</span>
                    ) : (
                      <span style={{ color: "#E24B4A", fontWeight: 500 }}>⚠ Unassigned! Load Overload.</span>
                    )}
                  </span>
                  <span style={{ fontSize: 10, color: themeCss.muted }}>{timeAgo(bug.created)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Intelligence View */}
        <div style={{ padding: "16px", overflowY: "auto", background: isDark ? "#181818" : "#FCFCFA" }}>
          
          {/* Dev Workloads */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: themeCss.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Team Workload & Capacity</div>
            {developers.map((d) => <DevCard key={d.accountId} dev={d} isDark={isDark} />)}
          </div>

          {/* Deep Bug Dive */}
          {selectedBug && (
            <div style={{ animation: "fadeIn 0.2s ease", borderTop: `1px solid ${themeCss.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: themeCss.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Deep Ticket Analysis</div>
              
              <div style={{ background: themeCss.bg, borderRadius: 8, padding: "16px", fontSize: 12, border: `1px solid ${themeCss.border}`, color: themeCss.text }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 15 }}>{selectedBug.id}</h4>
                <a href={`https://jagmeetsingh0106007.atlassian.net/browse/${selectedBug.id}`} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? "#4B9DF5" : "#185FA5", textDecoration: "none", display: "inline-block", marginBottom: 16, borderBottom: `1px dashed ${isDark ? "#4B9DF5" : "#185FA5"}` }}>Open Native Jira Thread ↗</a>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 4px", marginBottom: 16 }}>
                   <div style={{color: themeCss.muted}}>Status / Opened</div> <div style={{fontWeight:500}}>{selectedBug.status} • {timeAgo(selectedBug.created)}</div>
                   <div style={{color: themeCss.muted}}>Raw Priority</div> <div style={{fontWeight:500}}>{selectedBug.priority}</div>
                   <div style={{color: themeCss.muted}}>Reporter</div> <div style={{fontWeight:500}}>{selectedBug.reporter}</div>
                   <div style={{color: themeCss.muted}}>Triggers Captured</div> <div style={{fontWeight:500}}>{selectedBug.matched_keywords?.join(", ")}</div>
                </div>

                <div style={{ borderTop: `1px dashed ${themeCss.border}`, paddingTop: 12, marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: themeCss.muted, textTransform: "uppercase", marginBottom: 6 }}>Full Raw Description Payload</div>
                  <div style={{ background: isDark ? "#222" : "#F5F5F5", padding: "10px", borderRadius: 6, maxHeight: 120, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                     {selectedBug.description || "—"}
                  </div>
                </div>

                {selectedBug.reasoning && (
                  <div style={{ borderTop: `1px dashed ${themeCss.border}`, paddingTop: 12, marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: themeCss.muted, textTransform: "uppercase", marginBottom: 6 }}>Decision Audit Log</div>
                    <div style={{ color: isDark ? "#9A8FFF" : "#534AB7", fontStyle: "italic" }}>"{selectedBug.reasoning}"</div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer Instructions */}
      <div style={{ padding: "8px 20px", background: themeCss.header, borderTop: `1px solid ${themeCss.border}`, fontSize: 11, color: themeCss.muted, display: "flex", justifyContent: "space-between" }}>
        <span>Keyboard Shortcuts: <b>A</b> (Accept Mode) — <b>R</b> (Reassign Mode) — Selected Bug Binding Active</span>
        <span>Version 2.0 Enterprise</span>
      </div>
      
    </div>
  );
}
