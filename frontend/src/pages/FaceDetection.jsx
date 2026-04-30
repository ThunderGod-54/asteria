import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaceDetector } from 'face-detection-module';
import { saveSession } from '../services/sessionStore';
import { 
  Trophy, ThumbsUp, TrendingUp, AlertTriangle, 
  Sparkles, Play, Square, Activity, Clock, Eye, 
  Shuffle, Brain, ArrowRight, Shield, Zap, Info,
  History, BarChart2, Calendar, Target, MousePointer2
} from 'lucide-react';
import { useTheme } from "../Theme";

const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

const Noise = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

export default function FaceDetection() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [sessionData, setSessionData] = useState(null);
  const [report, setReport] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [, forceRender] = useState(0);

  const sessionRef = useRef(null);
  const awayEvents = useRef([]);
  const openEvent = useRef(null);
  const reportRef = useRef(null);
  const tickRef = useRef(null);
  const alertAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const addLog = useCallback((message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
      alertAudio.current.currentTime = 0;
      alertAudio.current.play().catch(e => console.log("Audio play blocked", e));
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

    const builtReport = {
      date: fmtDate(s.startTime),
      startTime: fmt(s.startTime),
      endTime: fmt(now),
      startTimeISO: s.startTime.toISOString(),
      endTimeISO: now.toISOString(),
      totalDuration: elapsed(totalMs),
      focusedTime: elapsed(focusedMs),
      awayTime: elapsed(s.totalAwayMs),
      attentionPercent: attentionPct,
      noFaceAlerts: s.noFaceAlerts,
      tabSwitches: s.tabSwitches,
      awayEvents: [...awayEvents.current],
      grade: attentionPct >= 85 ? 'Excellent' : attentionPct >= 65 ? 'Good' : attentionPct >= 40 ? 'Fair' : 'Needs Improvement',
    };
    saveSession(builtReport);
    setReport(builtReport);

    sessionRef.current = null;
    setSessionData(null);
    setStatus('Idle');
    addLog('Session ended', 'info');
    setIsDetecting(false);

    // Auto-scroll to report after a short delay to allow DOM update
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const liveStats = (() => {
    const s = sessionRef.current;
    if (!s) return null;
    const now = new Date();
    const totalMs = now - s.startTime;
    const liveAway = openEvent.current ? now - openEvent.current.startTime : 0;
    const awayMs = s.totalAwayMs + liveAway;
    return {
      startTime: s.startTime,
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

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

      .fade-up {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
      }
      .fade-up.visible { opacity: 1; transform: translateY(0); }

      .glow-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      .glow-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .glow-btn:hover::after { opacity: 1; }
      .glow-btn:hover { transform: translateY(-2px); }

      .premium-card {
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        position: relative;
        overflow: hidden;
      }
      .premium-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s;
      }
      .premium-card:hover::before { opacity: 1; }

      .cursor-dot {
        width: 6px; height: 6px;
        background: white;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        zIndex: 9999;
        transition: transform 0.1s;
        mix-blend-mode: difference;
      }
      .cursor-ring {
        width: 32px; height: 32px;
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        zIndex: 9998;
        transition: all 0.15s ease;
        mix-blend-mode: difference;
      }

      .insight-item {
        position: relative;
        padding-left: 20px;
        margin-bottom: 12px;
      }
      .insight-item::before {
        content: '→';
        position: absolute;
        left: 0;
        color: ${fgMuted};
      }
    `;
    document.head.appendChild(style);

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach(el => obs.observe(el));

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    const moveMouse = e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = `${mx - 3}px`;
      dot.style.top = `${my - 3}px`;
    };
    const animRing = () => {
      rx += (mx - rx - 16) * 0.12;
      ry += (my - ry - 16) * 0.12;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(animRing);
    };
    window.addEventListener("mousemove", moveMouse);
    animRing();

    return () => {
      document.head.removeChild(style);
      window.removeEventListener("mousemove", moveMouse);
      dot.remove(); ring.remove();
      obs.disconnect();
    };
  }, [fgMuted]);

  // Separate effect to handle IntersectionObserver for dynamic content
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { 
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      }),
      { threshold: 0.1 }
    );

    const observeElements = () => {
      document.querySelectorAll(".fade-up:not(.visible)").forEach(el => obs.observe(el));
    };

    observeElements();
    
    // Also observe when report is generated or session status changes
    const timeout = setTimeout(observeElements, 500);
    return () => {
      obs.disconnect();
      clearTimeout(timeout);
    };
  }, [report, isDetecting]);

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <Noise />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px" }}>
        
        {/* ── HEADER ── */}
        <header className="fade-up" style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 500, color: fgMuted, marginBottom: 20, letterSpacing: 0.5 }}>
            <Activity size={12} />
            REAL-TIME ATTENTION TRACKING
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 6vw, 64px)", letterSpacing: -0.5, lineHeight: 1.1, margin: 0 }}>
            ZENITH <span style={{ WebkitTextStroke: `1px ${fg}`, color: "transparent" }}>FOCUS</span> MONITOR
          </h1>
          <p style={{ color: fgMuted, fontSize: 16, maxWidth: 600, marginTop: 12, lineHeight: 1.5 }}>
            Advanced computer vision monitoring. Tracking focus levels, tab switches, and app minimizes in real-time.
          </p>
        </header>

        {/* ── CONTROLS ── */}
        <div className="fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
          <button 
            className="glow-btn" 
            onClick={isDetecting ? stopSession : startSession}
            style={{ 
              background: isDetecting ? "transparent" : fg, 
              color: isDetecting ? fg : bg, 
              border: isDetecting ? `1px solid ${border}` : "none",
              borderRadius: 14, padding: "16px 32px", fontSize: 15, fontWeight: 700, 
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {isDetecting ? (
              <>
                <Square size={16} fill="currentColor" /> Stop & Get Report
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Start New Session
              </>
            )}
          </button>
          
          <div style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "0 24px",
            background: cardBg, borderRadius: 14, border: `1px solid ${border}`,
            fontSize: 14, color: fgMuted
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === 'Face Detected' ? "#4ade80" : "#fbbf24" }} />
            <span style={{ fontWeight: 600, color: fg }}>{status}</span>
          </div>

          {!isDetecting && !report && (
            <button 
              onClick={() => {
                const demo = {
                  date: fmtDate(new Date()),
                  startTime: "09:00 AM",
                  endTime: "10:30 AM",
                  totalDuration: "1h 30m",
                  focusedTime: "1h 12m",
                  awayTime: "18m",
                  attentionPercent: 82,
                  noFaceAlerts: 4,
                  tabSwitches: 3,
                  awayEvents: [
                    { startTime: new Date(), endTime: new Date(), durationMs: 600000, kind: 'tab', label: 'Slack' },
                    { startTime: new Date(), endTime: new Date(), durationMs: 300000, kind: 'minimize', label: 'Spotify' }
                  ],
                  grade: 'Excellent',
                  pulseData: [80, 85, 70, 90, 88, 95, 60, 85, 90]
                };
                setReport(demo);
              }}
              style={{ 
                background: "transparent", color: fgMuted, border: `1px solid ${border}`, 
                borderRadius: 14, padding: "16px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" 
              }}
            >
              View Demo Report
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32, alignItems: "start" }}>
          
          {/* ── CAMERA FEED ── */}
          <div className="fade-up">
            <div className="premium-card" style={{ 
              borderRadius: 24, overflow: "hidden", 
              border: `1px solid ${border}`, background: "#000",
              aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative"
            }}>
              {isDetecting ? (
                <FaceDetector
                  width={640}
                  height={480}
                  noFaceGrace={1000}
                  alertOnNoFace={true}
                  onFaceDetected={handleFaceDetected}
                  onNoFace={handleNoFace}
                />
              ) : (
                <div style={{ textAlign: "center", color: fgMuted }}>
                  <Eye size={40} style={{ marginBottom: 16, opacity: 0.15 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>SYSTEM IDLE</p>
                </div>
              )}

              {isDetecting && liveStats?.currentlyAway && (
                <div style={{
                  position: "absolute", inset: 0, 
                  background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  zIndex: 20, textAlign: "center", padding: 32
                }}>
                  <Zap size={48} color="#fbbf24" style={{ marginBottom: 20 }} />
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, margin: 0, color: "#fff" }}>DISTRACTION</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 8 }}>{liveStats.awayLabel}</p>
                  <div style={{ 
                    marginTop: 24, background: "#fff", color: "#000", 
                    padding: "8px 24px", borderRadius: 999, fontWeight: 800, fontSize: 16
                  }}>
                    {liveStats.liveAwayTime}
                  </div>
                </div>
              )}
            </div>
            
            {/* Camera Accents */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "0 8px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: fgMuted }} />
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: fgMuted }} />
              </div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: fgMuted }}>REC // ATTENTION_STREAM</div>
            </div>
          </div>

          {/* ── LIVE DATA ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Live Metrics Grid */}
            <div className="premium-card fade-up" style={{ 
              background: cardBg, border: `1px solid ${border}`, 
              borderRadius: 24, padding: 32 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, margin: 0 }}>LIVE SESSION</h3>
                {isDetecting && <div style={{ fontSize: 12, fontWeight: 800, color: fgMuted }}>{liveStats?.duration}</div>}
              </div>

              {!isDetecting ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: fgMuted }}>
                  <p style={{ fontSize: 14 }}>Start a session to view real-time intelligence.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <LiveStatCard label="STARTED" value={fmt(liveStats.startTime)} icon={<Calendar size={14}/>} />
                    <LiveStatCard label="DURATION" value={liveStats.duration} icon={<Clock size={14}/>} />
                    <LiveStatCard label="ATTENTION" value={`${liveStats.attentionPct}%`} icon={<Brain size={14}/>} 
                      color={liveStats.attentionPct >= 75 ? "#4ade80" : liveStats.attentionPct >= 50 ? "#fbbf24" : "#f87171"} />
                    <LiveStatCard label="AWAY TIME" value={liveStats.awayTime} icon={<Zap size={14}/>} />
                    <LiveStatCard label="DISTRACTIONS" value={liveStats.tabSwitches} icon={<Shuffle size={14}/>} />
                    <LiveStatCard label="ALERTS" value={liveStats.noFaceAlerts} icon={<AlertTriangle size={14}/>} />
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                      <span style={{ color: fgMuted, fontWeight: 600 }}>FOCUS PERFORMANCE</span>
                      <span style={{ fontWeight: 800 }}>{liveStats.attentionPct}%</span>
                    </div>
                    <div style={{ height: 6, background: border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ 
                        height: "100%", width: `${liveStats.attentionPct}%`, 
                        background: liveStats.attentionPct >= 75 ? fg : "#fbbf24", 
                        borderRadius: 3, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" 
                      }} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Activity Stream */}
            <div className="premium-card fade-up" style={{ 
              background: cardBg, border: `1px solid ${border}`, 
              borderRadius: 24, padding: 32, flex: 1
            }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, marginBottom: 24 }}>ACTIVITY STREAM</h3>
              {logs.length === 0 ? (
                <div style={{ padding: "20px 0", color: fgMuted }}>
                  <p style={{ fontSize: 14 }}>Waiting for tracking activity...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {logs.map((log, i) => (
                    <div key={i} style={{ 
                      display: "flex", gap: 16, alignItems: "start", paddingBottom: 14,
                      borderBottom: i === logs.length - 1 ? "none" : `1px solid ${border}`,
                      fontSize: 13, color: log.type === 'error' ? "#f87171" : log.type === 'warn' ? "#fbbf24" : fg
                    }}>
                      <span style={{ fontFamily: "monospace", opacity: 0.4, fontSize: 11, paddingTop: 2 }}>{log.time}</span>
                      <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SESSION REPORT ── */}
        {report && (
          <div ref={reportRef} className="fade-up" style={{ marginTop: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, margin: 0 }}>SESSION <span style={{ color: fgMuted }}>INTELLIGENCE</span></h2>
              <div style={{ height: 1, flex: 1, background: border }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, marginBottom: 40, flexWrap: "wrap" }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '1.5rem', 
                backgroundColor: cardBg, borderRadius: '24px', padding: '32px', 
                border: `1px solid ${cardBorder}`, height: "100%"
              }}>
                <GradeIcon grade={report.grade} size={48} />
                <div>
                  <div style={{ color: fg, fontWeight: 800, fontSize: '2.4rem', lineHeight: 1, letterSpacing: '-1px', fontFamily: "'Bebas Neue', sans-serif" }}>{report.grade.toUpperCase()}</div>
                  <div style={{ color: fgMuted, fontSize: '14px', fontWeight: 500, marginTop: 4 }}>Attention Rating</div>
                </div>
              </div>

              <div style={{ 
                backgroundColor: cardBg, borderRadius: '24px', padding: '32px', 
                border: `1px solid ${cardBorder}`, position: "relative"
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: fgMuted, marginBottom: 16, letterSpacing: 1 }}>FOCUS PULSE</div>
                <FocusPulseChart data={report.pulseData || [70, 85, 60, 90, 75, 95, 80]} color={fg} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
              <ReportMetricCard label="Start Time"     value={report.startTime} />
              <ReportMetricCard label="End Time"       value={report.endTime} />
              <ReportMetricCard label="Total Duration" value={report.totalDuration} />
              <ReportMetricCard label="Focused Time"   value={report.focusedTime} />
              <ReportMetricCard label="Away Time"      value={report.awayTime} />
              <ReportMetricCard label="Attention"      value={`${report.attentionPercent}%`} highlight />
              <ReportMetricCard label="No-Face Alerts" value={report.noFaceAlerts} />
              <ReportMetricCard label="Distractions"   value={report.tabSwitches} />
            </div>

            {/* ATTENTION BAR */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: fgMuted, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Attention Score</span>
                <span style={{ color: fg, fontWeight: 800, fontSize: '14px' }}>{report.attentionPercent}%</span>
              </div>
              <div style={{ height: 6, background: border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: "100%", width: `${report.attentionPercent}%`, background: fg, borderRadius: 3 }} />
              </div>
            </div>

            {/* DISTRACTION LOG (TIMELINE) */}
            {report.awayEvents.length > 0 && (
              <div className="premium-card" style={{ 
                background: cardBg, border: `1px solid ${border}`, 
                borderRadius: 24, padding: 32, marginBottom: 32
              }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, marginBottom: 24 }}>DISTRACTION LOG</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {report.awayEvents.map((ev, i) => (
                    <div key={i} style={{ 
                      display: "grid", gridTemplateColumns: "100px 1fr 150px 100px", gap: 20,
                      padding: "16px 0", borderBottom: i === report.awayEvents.length - 1 ? "none" : `1px solid ${border}`,
                      alignItems: "center"
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: fgMuted }}>{fmt(new Date(ev.startTime))}</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{ev.label}</div>
                      <div style={{ fontSize: 12, color: fgMuted, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ background: border, padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>{ev.kind.toUpperCase()}</span>
                        {ev.endTime ? `to ${fmt(new Date(ev.endTime))}` : ""}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>{elapsed(ev.durationMs)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INSIGHTS */}
            <div className="premium-card" style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 24, padding: 32 }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, marginBottom: 20 }}>INSIGHTS</h3>
              <div style={{ color: fgMuted, fontSize: 14, lineHeight: 1.8 }}>
                {report.attentionPercent >= 85 && <div className="insight-item" style={{ color: fg }}>Great focus — you maintained strong attention throughout the session.</div>}
                {report.attentionPercent < 85 && report.attentionPercent >= 65 && <div className="insight-item">Good session. A few attention dips — try minimizing distractions.</div>}
                {report.attentionPercent < 65 && <div className="insight-item">Attention was low. Consider shorter sessions with breaks.</div>}
                {report.tabSwitches === 0 && <div className="insight-item" style={{ color: fg }}>Zero distractions — excellent focus environment!</div>}
                {report.tabSwitches > 0 && report.tabSwitches <= 3 && <div className="insight-item">Minimal distractions ({report.tabSwitches}) — good discipline.</div>}
                {report.tabSwitches > 3 && <div className="insight-item">You left the session {report.tabSwitches} times — try closing other apps before starting.</div>}
                {report.awayEvents.some(e => e.durationMs > 60000) && <div className="insight-item">At least one distraction lasted over a minute — consider using Do Not Disturb mode.</div>}
                {report.noFaceAlerts > 3 && <div className="insight-item">Multiple no-face alerts — make sure you're seated in front of the camera.</div>}
              </div>
            </div>

            <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
              <button 
                className="glow-btn"
                onClick={() => navigate('/tracker')}
                style={{ 
                  background: fg, color: bg, border: "none", borderRadius: 12, 
                  padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                Focus History <History size={16} />
              </button>
              <button 
                className="glow-btn"
                onClick={() => setReport(null)}
                style={{ 
                  background: "transparent", color: fg, border: `1px solid ${border}`, 
                  borderRadius: 12, padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer"
                }}
              >
                Close Report
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "60px 24px", borderTop: `1px solid ${border}`, background: "rgba(0,0,0,0.02)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>ZENITH</div>
            <p style={{ color: fgMuted, fontSize: 13, margin: 0 }}>© 2026 Zenith AI Focus System. Private by design.</p>
          </div>
          <div style={{ display: "flex", gap: 40, fontSize: 13, fontWeight: 600, color: fgMuted }}>
            <span style={{ cursor: "pointer" }}>Privacy</span>
            <span style={{ cursor: "pointer" }}>Infrastructure</span>
            <span style={{ cursor: "pointer" }}>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FocusPulseChart({ data, color }) {
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - v}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 60, overflow: "visible" }}>
      <defs>
        <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0,100 L ${points} L 100,100 Z`}
        fill="url(#pulseGradient)"
        style={{ transition: "all 1s ease" }}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ transition: "all 1s ease", opacity: 0.8 }}
      />
      {data.map((v, i) => (
        <circle 
          key={i} 
          cx={(i / (data.length - 1)) * 100} 
          cy={100 - v} 
          r="1.5" 
          fill={color} 
        />
      ))}
    </svg>
  );
}

function LiveStatCard({ label, value, icon, color: customColor }) {
  const { dark } = useTheme();
  const cardBg = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const labelColor = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const valueColor = dark ? "#fff" : "#000";
  return (
    <div style={{ 
      padding: '12px 16px', background: cardBg, 
      borderRadius: '12px', border: `1px solid ${cardBorder}`,
      display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      <div style={{ fontSize: '10px', fontWeight: 800, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: customColor || valueColor }}>{value}</div>
    </div>
  );
}

function ReportMetricCard({ label, value, highlight = false }) {
  const { dark } = useTheme();
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const cardBorder = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const labelColor = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const valueColor = dark ? (highlight ? "#fff" : "rgba(255,255,255,0.85)") : (highlight ? "#000" : "rgba(0,0,0,0.85)");

  return (
    <div style={{ 
      background: cardBg, border: `1px solid ${cardBorder}`, 
      borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  );
}

function GradeIcon({ grade, size = 24 }) {
  const { dark } = useTheme();
  const color = dark ? "#fff" : "#000";
  if (grade === 'Excellent') return <Trophy size={size} color={color} />;
  if (grade === 'Good')      return <ThumbsUp size={size} color={color} />;
  if (grade === 'Fair')      return <TrendingUp size={size} color={color} />;
  return <AlertTriangle size={size} color={color} />;
}

