import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaceDetector } from 'face-detection-module';
const fmt = (d) => d.toLocaleTimeString();
const fmtDate = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const elapsed = (ms) => {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};
const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));
let _evId = 0;
const newAwayEvent = (kind, label) => ({
  id: ++_evId, kind, label,
  startTime: new Date(), endTime: null, durationMs: null,
});

export default function FaceDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [sessionData, setSessionData] = useState(null);
  const [report, setReport] = useState(null);
  const [, forceRender] = useState(0);

  const sessionRef = useRef(null);
  const awayEvents = useRef([]);
  const openEvent = useRef(null);
  const tickRef = useRef(null);
  const alertAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Premium notification sound


  const addLog = useCallback((message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 12));
  }, []);
  useEffect(() => {
    if (isDetecting) {
      tickRef.current = setInterval(() => forceRender(n => n + 1), 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [isDetecting]);


  useEffect(() => {
    if (!isDetecting) return;


    const goAway = (kind, label) => {

      if (openEvent.current) return;
      const ev = newAwayEvent(kind, label);
      openEvent.current = ev;
      if (sessionRef.current) sessionRef.current.tabSwitches += 1;
      addLog(`🔴 ${label}`, 'warn');
    };
    const comeBack = (returnLabel) => {
      if (!openEvent.current) return;
      const ev = openEvent.current;
      ev.endTime = new Date();
      ev.durationMs = ev.endTime - ev.startTime;
      awayEvents.current.push({ ...ev });
      openEvent.current = null;
      if (sessionRef.current) sessionRef.current.totalAwayMs += ev.durationMs;
      addLog(`🟢 ${returnLabel} (away ${elapsed(ev.durationMs)})`, 'info');
    };


    const onVisChange = () => {
      if (document.hidden) {
        goAway('tab', `Tab hidden — "${document.title}"`);
      } else {
        comeBack('Tab visible again');
      }
    };
    const onBlur = () => {
      if (!document.hidden) {
        goAway('minimize', 'Window minimized / app switched');
      }
    };

    const onFocus = () => {
      if (!document.hidden) {
        comeBack('Window focused again');
      }
    };

    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [isDetecting, addLog]);

  const handleFaceDetected = useCallback((detections) => {
    setStatus('Face Detected');
    if (sessionRef.current) sessionRef.current.faceFrames += 1;
  }, []);

  const handleNoFace = useCallback(() => {
    setStatus('No Face Detected!');
    if (sessionRef.current) {
      sessionRef.current.noFaceAlerts += 1;
      // Play alert sound
      alertAudio.current.currentTime = 0;
      alertAudio.current.play().catch(e => console.log("Audio play blocked by browser", e));
    }
    addLog('⚠️ No face detected!', 'error');
  }, [addLog]);
  const startSession = () => {
    const now = new Date();
    sessionRef.current = {
      startTime: now,
      faceFrames: 0,
      noFaceAlerts: 0,
      tabSwitches: 0,
      totalAwayMs: 0,
    };
    awayEvents.current = [];
    openEvent.current = null;
    setSessionData({ startTime: now });
    setReport(null);
    setStatus('Initializing...');
    addLog('Session started', 'info');
    setIsDetecting(true);
  };

  const stopSession = () => {
    const now = new Date();
    const s = sessionRef.current;
    if (!s) return;
    if (openEvent.current) {
      const ev = openEvent.current;
      ev.endTime = now;
      ev.durationMs = now - ev.startTime;
      awayEvents.current.push({ ...ev });
      s.totalAwayMs += ev.durationMs;
      openEvent.current = null;
    }

    const totalMs = now - s.startTime;
    const focusedMs = Math.max(0, totalMs - s.totalAwayMs);
    const attentionPct = pct(s.faceFrames, s.faceFrames + s.noFaceAlerts);

    setReport({
      date: fmtDate(s.startTime),
      startTime: fmt(s.startTime),
      endTime: fmt(now),
      totalDuration: elapsed(totalMs),
      focusedTime: elapsed(focusedMs),
      awayTime: elapsed(s.totalAwayMs),
      attentionPercent: attentionPct,
      noFaceAlerts: s.noFaceAlerts,
      tabSwitches: s.tabSwitches,
      awayEvents: [...awayEvents.current],
      grade: attentionPct >= 85 ? 'Excellent' : attentionPct >= 65 ? 'Good' : attentionPct >= 40 ? 'Fair' : 'Needs Improvement',
    });

    sessionRef.current = null;
    setSessionData(null);
    setStatus('Idle');
    addLog('Session ended', 'info');
    setIsDetecting(false);
  };
  const liveStats = (() => {
    const s = sessionRef.current;
    if (!s) return null;
    const now = new Date();
    const totalMs = now - s.startTime;
    const liveAway = openEvent.current ? now - openEvent.current.startTime : 0;
    const awayMs = s.totalAwayMs + liveAway;
    return {
      duration: elapsed(totalMs),
      attentionPct: pct(s.faceFrames, s.faceFrames + s.noFaceAlerts),
      tabSwitches: s.tabSwitches,
      noFaceAlerts: s.noFaceAlerts,
      awayTime: elapsed(awayMs),
      currentlyAway: !!openEvent.current,
      awayLabel: openEvent.current?.label ?? null,
      liveAwayTime: liveAway > 0 ? elapsed(liveAway) : null,
    };
  })();

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>Face Detection System</h1>
        <p style={S.desc}>
          Tracks your attention in real-time — tab switches, app switches, and window minimizes are all recorded.
        </p>
      </div>

      <div style={S.controls}>
        <button
          style={isDetecting ? S.stopBtn : S.startBtn}
          onClick={isDetecting ? stopSession : startSession}
        >
          {isDetecting ? '⏹ Stop & Get Report' : '▶ Start Session'}
        </button>
      </div>

      <div style={S.content}>
        <div style={S.videoSection}>
          {isDetecting ? (
            <div style={S.detectorWrapper}>
              <FaceDetector
                width={640}
                height={480}
                noFaceGrace={1000}
                alertOnNoFace={true}
                onFaceDetected={handleFaceDetected}
                onNoFace={handleNoFace}
              />
            </div>
          ) : (
            <div style={S.placeholder}>
              <div style={S.placeholderIcon}>📷</div>
              <p>Camera offline</p>
            </div>
          )}
        </div>

        <div style={S.infoSection}>
          <div style={S.card}>
            <h3 style={S.cardTitle}>System Status</h3>
            <div style={{
              ...S.badge,
              backgroundColor:
                status === 'Idle' ? '#444' :
                  status === 'Initializing...' ? '#f59f00' :
                    status === 'Face Detected' ? '#2b8a3e' : '#e03131'
            }}>
              {status}
            </div>
          </div>
          {isDetecting && liveStats && (
            <div style={{ ...S.card, border: liveStats.currentlyAway ? '1px solid #e03131' : '1px solid #2c2e33' }}>
              <h3 style={S.cardTitle}>📊 Live Session Stats</h3>
              {liveStats.currentlyAway && (
                <div style={S.awayBanner}>
                  <span>🔴 Away: {liveStats.awayLabel}</span>
                  <span style={{ fontWeight: 700 }}>{liveStats.liveAwayTime}</span>
                </div>
              )}

              <div style={S.statsGrid}>
                <StatItem label="Started" value={sessionData?.startTime ? fmt(sessionData.startTime) : '—'} />
                <StatItem label="Duration" value={liveStats.duration} />
                <StatItem label="Attention" value={`${liveStats.attentionPct}%`}
                  highlight={liveStats.attentionPct >= 75 ? 'green' : liveStats.attentionPct >= 50 ? 'yellow' : 'red'} />
                <StatItem label="Away Time" value={liveStats.awayTime} />
                <StatItem label="Distractions" value={liveStats.tabSwitches} />
                <StatItem label="No-Face Alerts" value={liveStats.noFaceAlerts} />
              </div>
              <AttentionBar pct={liveStats.attentionPct} />
            </div>
          )}
          <div style={{ ...S.card, flex: 1, minHeight: '200px' }}>
            <h3 style={S.cardTitle}>Recent Activity</h3>
            {logs.length === 0 ? (
              <p style={{ color: '#888', margin: 0 }}>No activity yet.</p>
            ) : (
              <ul style={S.logList}>
                {logs.map((log, i) => (
                  <li key={i} style={{
                    ...S.logItem,
                    borderLeftColor: log.type === 'error' ? '#e03131' : log.type === 'warn' ? '#f59f00' : log.type === 'success' ? '#2b8a3e' : '#444'
                  }}>
                    <span style={S.logTime}>[{log.time}]</span>
                    <span style={{ color: log.type === 'error' ? '#ff8787' : log.type === 'warn' ? '#ffd43b' : log.type === 'success' ? '#8ce99a' : '#e9ecef' }}>
                      {log.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {report && <SessionReport report={report} />}
    </div>
  );
}
function StatItem({ label, value, highlight }) {
  const color = highlight === 'green' ? '#8ce99a' : highlight === 'yellow' ? '#ffd43b' : highlight === 'red' ? '#ff8787' : '#e9ecef';
  return (
    <div style={S.statItem}>
      <span style={S.statLabel}>{label}</span>
      <span style={{ ...S.statValue, color }}>{value}</span>
    </div>
  );
}

function AttentionBar({ pct: p }) {
  const color = p >= 75 ? '#2b8a3e' : p >= 50 ? '#f59f00' : '#e03131';
  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#adb5bd', fontSize: '0.85rem' }}>Attention Score</span>
        <span style={{ color, fontWeight: 700 }}>{p}%</span>
      </div>
      <div style={S.barBg}>
        <div style={{ ...S.barFill, width: `${p}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SessionReport({ report }) {
  const gradeColor = report.grade === 'Excellent' ? '#8ce99a' : report.grade === 'Good' ? '#74c0fc' : report.grade === 'Fair' ? '#ffd43b' : '#ff8787';

  return (
    <div style={S.reportContainer}>
      <h2 style={S.reportTitle}>📋 Session Report</h2>
      <p style={{ color: '#868e96', margin: '0 0 1.5rem 0' }}>{report.date}</p>
      <div style={{ ...S.gradeBanner, borderColor: gradeColor }}>
        <span style={{ fontSize: '2rem' }}>
          {report.grade === 'Excellent' ? '🏆' : report.grade === 'Good' ? '👍' : report.grade === 'Fair' ? '📈' : '⚠️'}
        </span>
        <div>
          <div style={{ color: gradeColor, fontWeight: 800, fontSize: '1.4rem' }}>{report.grade}</div>
          <div style={{ color: '#adb5bd', fontSize: '0.9rem' }}>Overall attention rating</div>
        </div>
      </div>
      <div style={S.reportGrid}>
        <ReportCard icon="🕐" label="Start Time" value={report.startTime} />
        <ReportCard icon="🕔" label="End Time" value={report.endTime} />
        <ReportCard icon="⏱" label="Total Duration" value={report.totalDuration} />
        <ReportCard icon="🎯" label="Focused Time" value={report.focusedTime} />
        <ReportCard icon="🚶" label="Away Time" value={report.awayTime} />
        <ReportCard icon="👁" label="Attention %" value={`${report.attentionPercent}%`}
          highlight={report.attentionPercent >= 75 ? '#8ce99a' : report.attentionPercent >= 50 ? '#ffd43b' : '#ff8787'} />
        <ReportCard icon="🔔" label="No-Face Alerts" value={report.noFaceAlerts} />
        <ReportCard icon="🔀" label="Distractions" value={report.tabSwitches} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <AttentionBar pct={report.attentionPercent} />
      </div>
      {report.awayEvents.length > 0 && (
        <div style={S.timelineSection}>
          <h3 style={S.cardTitle}>🗂 Distraction Log</h3>
          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>Details</th>
                  <th style={S.th}>Left At</th>
                  <th style={S.th}>Returned At</th>
                  <th style={S.th}>Duration Away</th>
                </tr>
              </thead>
              <tbody>
                {report.awayEvents.map((ev, i) => (
                  <tr key={ev.id} style={{ backgroundColor: i % 2 === 0 ? '#25262b' : '#1e1f23' }}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>
                      <span style={{
                        ...S.typePill,
                        backgroundColor: ev.kind === 'tab' ? '#1864ab' : '#862e9c'
                      }}>
                        {ev.kind === 'tab' ? '🗂 Tab' : '🖥 App/Min'}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: '#adb5bd', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.label}
                    </td>
                    <td style={S.td}>{fmt(ev.startTime)}</td>
                    <td style={S.td}>{ev.endTime ? fmt(ev.endTime) : '—'}</td>
                    <td style={{ ...S.td, color: ev.durationMs > 30000 ? '#ff8787' : ev.durationMs > 10000 ? '#ffd43b' : '#8ce99a', fontWeight: 700 }}>
                      {ev.durationMs ? elapsed(ev.durationMs) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={S.insightsSection}>
        <h3 style={S.cardTitle}>💡 Insights</h3>
        <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: '#adb5bd', lineHeight: '1.9' }}>
          {report.attentionPercent >= 85 && <li>Great focus — you maintained strong attention throughout the session.</li>}
          {report.attentionPercent < 85 && report.attentionPercent >= 65 && <li>Good session. A few attention dips — try minimizing distractions.</li>}
          {report.attentionPercent < 65 && <li>Attention was low. Consider shorter sessions with breaks.</li>}
          {report.tabSwitches === 0 && <li>Zero distractions — excellent focus environment!</li>}
          {report.tabSwitches > 0 && report.tabSwitches <= 3 && <li>Minimal distractions ({report.tabSwitches}) — good discipline.</li>}
          {report.tabSwitches > 3 && <li>You left the session {report.tabSwitches} times — try closing other apps before starting.</li>}
          {report.awayEvents.some(e => e.durationMs > 60000) && <li>At least one distraction lasted over a minute — consider using Do Not Disturb mode.</li>}
          {report.noFaceAlerts > 3 && <li>Multiple no-face alerts — make sure you're seated in front of the camera.</li>}
        </ul>
      </div>
    </div>
  );
}

function ReportCard({ icon, label, value, highlight }) {
  return (
    <div style={S.reportCard}>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      <div>
        <div style={{ color: '#868e96', fontSize: '0.8rem', marginBottom: '2px' }}>{label}</div>
        <div style={{ color: highlight || '#e9ecef', fontWeight: 700, fontSize: '1.05rem' }}>{value}</div>
      </div>
    </div>
  );
}
const S = {
  container: {
    padding: '2rem', maxWidth: '1200px', margin: '0 auto',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    minHeight: '100vh', color: '#e9ecef',
  },
  header: { marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1.5rem' },
  title: {
    fontSize: '2.5rem', margin: '0 0 0.5rem 0',
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800',
  },
  desc: { color: '#adb5bd', margin: 0, fontSize: '1.05rem', lineHeight: '1.5' },
  controls: { marginBottom: '2rem', display: 'flex', justifyContent: 'center' },
  startBtn: {
    backgroundColor: '#1c7ed6', color: '#fff', border: 'none',
    padding: '14px 32px', fontSize: '1.1rem', borderRadius: '50px',
    cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 15px rgba(28,126,214,0.4)',
  },
  stopBtn: {
    backgroundColor: '#fa5252', color: '#fff', border: 'none',
    padding: '14px 32px', fontSize: '1.1rem', borderRadius: '50px',
    cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 15px rgba(250,82,82,0.4)',
  },
  content: { display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' },
  videoSection: { flex: '1 1 auto', maxWidth: '640px', display: 'flex', justifyContent: 'center' },
  detectorWrapper: {
    borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '2px solid #2b2b2b', backgroundColor: '#000',
  },
  placeholder: {
    width: '100%', maxWidth: '640px', aspectRatio: '4/3', backgroundColor: '#111',
    borderRadius: '16px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    color: '#666', border: '2px dashed #333', fontSize: '1.1rem',
  },
  placeholderIcon: { fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 },
  infoSection: { flex: '1 1 340px', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  card: {
    backgroundColor: '#1a1b1e', padding: '1.25rem',
    borderRadius: '16px', border: '1px solid #2c2e33', boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
  },
  cardTitle: { margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#f8f9fa', fontWeight: '600' },
  badge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 18px', borderRadius: '30px', fontWeight: '700',
    fontSize: '1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  awayBanner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#3b1212', border: '1px solid #e03131', borderRadius: '10px',
    padding: '0.6rem 1rem', marginBottom: '1rem', color: '#ff8787', fontSize: '0.9rem',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  statItem: {
    backgroundColor: '#25262b', borderRadius: '10px', padding: '0.75rem 1rem',
    display: 'flex', flexDirection: 'column', gap: '2px',
  },
  statLabel: { color: '#868e96', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { color: '#e9ecef', fontWeight: '700', fontSize: '1.05rem' },
  barBg: { height: '10px', backgroundColor: '#25262b', borderRadius: '99px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '99px', transition: 'width 0.5s ease' },
  logList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  logItem: {
    fontSize: '0.88rem', padding: '8px 10px', backgroundColor: '#25262b',
    borderRadius: '8px', display: 'flex', gap: '0.6rem', alignItems: 'center', borderLeft: '3px solid #444',
  },
  logTime: { color: '#868e96', fontFamily: '"Fira Code", monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' },

  reportContainer: {
    marginTop: '3rem', backgroundColor: '#1a1b1e', borderRadius: '20px',
    border: '1px solid #2c2e33', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  reportTitle: {
    margin: '0 0 0.25rem 0', fontSize: '1.8rem', fontWeight: '800',
    background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  gradeBanner: {
    display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#25262b',
    borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.5rem', border: '2px solid',
  },
  reportGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem', marginBottom: '1.5rem',
  },
  reportCard: {
    backgroundColor: '#25262b', borderRadius: '12px', padding: '1rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #333',
  },
  timelineSection: { marginBottom: '1.5rem' },
  tableWrapper: { overflowX: 'auto', borderRadius: '12px', border: '1px solid #333' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: {
    padding: '10px 14px', textAlign: 'left', color: '#868e96',
    backgroundColor: '#1e1f23', fontWeight: '600', fontSize: '0.8rem',
    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
  },
  td: { padding: '10px 14px', color: '#e9ecef', verticalAlign: 'middle' },
  typePill: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
    fontSize: '0.78rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap',
  },
  insightsSection: { backgroundColor: '#25262b', borderRadius: '12px', padding: '1.25rem', border: '1px solid #333' },
};
