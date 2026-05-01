import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { saveSession } from './sessionStore';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const SessionContext = createContext(null);

const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtDate = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const elapsed = (ms) => {
  if (!ms || ms <= 0) return '0s';
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
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

export function SessionProvider({ children }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [, forceRender] = useState(0);

  const sessionRef = useRef(null);
  const awayEvents = useRef([]);
  const openEvent = useRef(null);
  const socketRef = useRef(null);
  const tickRef = useRef(null);
  const alertAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  const addLog = useCallback((message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 20));
  }, []);

  // Socket + tick
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5001');
    }

    socketRef.current.on('distraction-log', ({ app }) => {
      if (openEvent.current) {
        openEvent.current.label = `Switched to: ${app}`;
        addLog(`🚩 Distraction: ${app}`, 'warn');
      }
    });

    if (isDetecting) {
      let ticks = 0;
      tickRef.current = setInterval(() => {
        ticks++;
        const s = sessionRef.current;
        if (!s) return;
        if (ticks % 30 === 0) {
          s.pulse.push(pct(s.faceFrames, s.faceFrames + s.noFaceAlerts));
        }
        const now = new Date();
        const liveAway = openEvent.current ? now - openEvent.current.startTime : 0;
        const liveData = {
          duration: elapsed(now - s.startTime),
          attentionPct: pct(s.faceFrames, s.faceFrames + s.noFaceAlerts),
          tabSwitches: s.tabSwitches,
          noFaceAlerts: s.noFaceAlerts,
          awayTime: elapsed(s.totalAwayMs + liveAway),
          currentlyAway: !!openEvent.current,
          awayLabel: openEvent.current?.label ?? null,
          startedAt: s.startTime.toISOString(),
        };
        localStorage.setItem('zenith_live_session', JSON.stringify(liveData));
        forceRender(n => n + 1);
      }, 1000);
    } else {
      clearInterval(tickRef.current);
      localStorage.removeItem('zenith_live_session');
    }

    return () => {
      clearInterval(tickRef.current);
      socketRef.current?.off('distraction-log');
    };
  }, [isDetecting, addLog]);

  // Visibility / blur / focus tracking
  useEffect(() => {
    if (!isDetecting) return;

    const goAway = (kind, label) => {
      if (openEvent.current) return;
      openEvent.current = newAwayEvent(kind, label);
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
        socketRef.current?.emit('tab-hidden');
      } else {
        comeBack('Tab visible again');
      }
    };
    const onBlur = () => { if (!document.hidden) { goAway('minimize', 'Window minimized / app switched'); socketRef.current?.emit('tab-hidden'); } };
    const onFocus = () => { if (!document.hidden) comeBack('Window focused again'); };

    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [isDetecting, addLog]);

  const startSession = useCallback(() => {
    const now = new Date();
    sessionRef.current = { startTime: now, faceFrames: 0, noFaceAlerts: 0, tabSwitches: 0, totalAwayMs: 0, pulse: [100] };
    awayEvents.current = [];
    openEvent.current = null;
    setReport(null);
    setLogs([]);
    setStatus('Initializing...');
    addLog('Session started', 'info');
    setIsDetecting(true);
  }, [addLog]);

  const stopSession = useCallback(() => {
    const now = new Date();
    const s = sessionRef.current;
    if (!s) return null;

    if (openEvent.current) {
      const ev = openEvent.current;
      ev.endTime = now;
      ev.durationMs = now - ev.startTime;
      awayEvents.current.push({ ...ev });
      s.totalAwayMs += ev.durationMs;
      openEvent.current = null;
    }

    const totalMs = now - s.startTime;
    const attentionPct = pct(s.faceFrames, s.faceFrames + s.noFaceAlerts);
    const builtReport = {
      date: fmtDate(s.startTime),
      startTime: fmt(s.startTime),
      endTime: fmt(now),
      startTimeISO: s.startTime.toISOString(),
      endTimeISO: now.toISOString(),
      totalDuration: elapsed(totalMs),
      focusedTime: elapsed(Math.max(0, totalMs - s.totalAwayMs)),
      awayTime: elapsed(s.totalAwayMs),
      attentionPercent: attentionPct,
      noFaceAlerts: s.noFaceAlerts,
      tabSwitches: s.tabSwitches,
      awayEvents: [...awayEvents.current],
      pulseData: s.pulse.length > 1 ? s.pulse : [attentionPct, attentionPct, attentionPct],
      grade: attentionPct >= 85 ? 'Excellent' : attentionPct >= 65 ? 'Good' : attentionPct >= 40 ? 'Fair' : 'Needs Improvement',
    };

    saveSession(builtReport);

    if (auth.currentUser) {
      addDoc(collection(db, 'sessions'), {
        ...builtReport,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        createdAt: new Date().toISOString(),
      }).catch(e => console.error('Firestore Error:', e));
    }

    sessionRef.current = null;
    setStatus('Idle');
    setIsDetecting(false);
    setReport(builtReport);
    addLog('Session ended', 'info');
    return builtReport;
  }, [addLog]);

  const handleFaceDetected = useCallback(() => {
    setStatus('Face Detected');
    if (sessionRef.current) sessionRef.current.faceFrames += 1;
  }, []);

  const handleNoFace = useCallback(() => {
    setStatus('No Face Detected!');
    if (sessionRef.current) {
      sessionRef.current.noFaceAlerts += 1;
      alertAudio.current.currentTime = 0;
      alertAudio.current.play().catch(() => {});
    }
    addLog('⚠️ No face detected!', 'error');
  }, [addLog]);

  const liveStats = (() => {
    const s = sessionRef.current;
    if (!s) return null;
    const now = new Date();
    const liveAway = openEvent.current ? now - openEvent.current.startTime : 0;
    return {
      startTime: s.startTime,
      duration: elapsed(now - s.startTime),
      attentionPct: pct(s.faceFrames, s.faceFrames + s.noFaceAlerts),
      tabSwitches: s.tabSwitches,
      noFaceAlerts: s.noFaceAlerts,
      awayTime: elapsed(s.totalAwayMs + liveAway),
      currentlyAway: !!openEvent.current,
      awayLabel: openEvent.current?.label ?? null,
      liveAwayTime: liveAway > 0 ? elapsed(liveAway) : null,
    };
  })();

  return (
    <SessionContext.Provider value={{
      isDetecting, status, logs, report, liveStats,
      startSession, stopSession, handleFaceDetected, handleNoFace,
      setReport,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
