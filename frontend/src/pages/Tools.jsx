import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import SketchlyCanvas from "sketchly-canvas";
import CodeEditor from "../components/CodeEditor";
import Pomodoro from "../components/Pomodoro";
import MusicPlayer from "../components/MusicPlayer";
import CalendarTool from "../components/CalendarTool";
import StudyPlanner from "../components/StudyPlanner";
import ResourceHub from "../components/ResourceHub";
import NoteTaker from "../components/NoteTaker";
import {
  GraduationCap, Clock, Music,
  Terminal, Code, PenTool,
  FileText, Settings, Share2,
  Sparkles, ArrowRight, ChevronRight,
  Monitor, Layout, Briefcase,
  Layers, Zap, Cpu, BookOpen, Laptop, Globe,
  Sun, Moon,
  Calendar as CalendarIcon
} from "lucide-react";
import { useTheme } from "../Theme";

const Noise = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// Renders SketchlyCanvas into a standalone root outside BrowserRouter to avoid nested Router error
function IsolatedCanvas({ roomId, serverUrl }) {
  const { dark } = useTheme();
  const containerRef = useRef(null);
  const rootRef = useRef(null);
  const mountRef = useRef(null);

  // Keep canvas theme in sync with app theme at all times
  useEffect(() => {
    window.__SKETCHLY_APP_ORIGIN__ = window.location.origin;
  }, [dark]);

  useEffect(() => {
    window.__SKETCHLY_DARK__ = dark;
    window.__SKETCHLY_APP_ORIGIN__ = window.location.origin;

    const el = document.createElement("div");
    el.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    mountRef.current = el;

    if (containerRef.current) {
      containerRef.current.appendChild(el);
      rootRef.current = createRoot(el);
      rootRef.current.render(
        <SketchlyCanvas serverUrl={serverUrl} roomId={roomId} asHost={true} showThemeToggle={false} />
      );
    }

    return () => {
      setTimeout(() => {
        try { rootRef.current?.unmount(); } catch { }
        try { mountRef.current?.remove(); } catch { }
      }, 0);
    };
  }, [roomId, serverUrl]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

export default function Tools({ initialRoomId }) {
  const [activeCategory, setActiveCategory] = useState("dev");
  const { dark, setDark } = useTheme();

  // Stable room ID — generate once, persist in sessionStorage so refreshes keep the same room
  const canvasRoomId = useMemo(() => {
    const stored = sessionStorage.getItem('zenith_canvas_room');
    if (stored) return stored;
    const id = `zenith-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('zenith_canvas_room', id);
    return id;
  }, []);

  const roomId = initialRoomId || canvasRoomId;

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      
      .fade-up {
        animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .bento-card {
        background: ${cardBg};
        border: 1px solid ${cardBorder};
        border-radius: 24px;
        padding: 32px;
        backdrop-filter: blur(20px);
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
      }
      .bento-card:hover {
        transform: translateY(-4px);
        border-color: ${fg};
      }

      .dock-item {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
        color: ${fgMuted};
      }
      .dock-item:hover, .dock-item.active {
        background: ${fg};
        color: ${bg};
        transform: translateY(-10px) scale(1.1);
      }
      .dock-item:hover .dock-label {
        opacity: 1;
        transform: translate(-50%, 40px);
      }
      .dock-item:active {
        transform: translateY(10px) scale(0.95);
      }
      .dock-label {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, 20px);
        opacity: 0;
        transition: all 0.3s;
        background: ${fg};
        color: ${bg};
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [dark, fg, bg, fgMuted, cardBg, cardBorder]);

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <Noise />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 120px", position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <header className="fade-up" style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: fgMuted, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
              <Cpu size={14} /> UTILITY STACK
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 1, margin: 0 }}>
              ZENITH <span style={{ WebkitTextStroke: `1px ${fg}`, color: "transparent" }}>TOOLS</span>
            </h1>
          </div>

        </header>

        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          {/* Category Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, margin: 0 }}>
              {activeCategory === 'dev' ? 'DEVELOPER TOOLS' : activeCategory === 'common' ? 'COMMON TOOLS' : 'STUDENT TOOLS'}
            </h2>
            <div style={{ flex: 1, height: 1, background: border }} />
          </div>

          {/* Dynamic Content */}
          {activeCategory === 'dev' && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <CodeEditor />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="bento-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Terminal size={18} color={fgMuted} />
                    <h4 style={{ margin: 0, fontSize: 14 }}>Terminal HUD</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: fgMuted }}>Live system activity and resource monitoring placeholder.</p>
                </div>
                <div className="bento-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Monitor size={18} color={fgMuted} />
                    <h4 style={{ margin: 0, fontSize: 14 }}>Code Focus</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: fgMuted }}>Distraction-free environment for deep coding sessions.</p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'common' && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridAutoRows: "minmax(200px, auto)",
              gap: 24
            }}>
              {/* Pomodoro - Medium (2x1) */}
              <div className="bento-card" style={{ gridColumn: "span 2" }}>
                <Pomodoro />
              </div>

              {/* Music Player - Medium (2x1) */}
              <div className="bento-card" style={{ gridColumn: "span 2" }}>
                <MusicPlayer />
              </div>

              {/* Calendar - Large (4x2) */}
              <div className="bento-card" style={{ gridColumn: "span 4", gridRow: "span 2" }}>
                <CalendarTool />
              </div>

              {/* Sketchly Canvas - Full width (4x2) */}
              <div style={{ gridColumn: "span 4", gridRow: "span 2", borderRadius: 24, overflow: "hidden", border: `1px solid ${cardBorder}`, minHeight: 500, position: "relative" }}>
                <IsolatedCanvas serverUrl={import.meta.env.VITE_API_URL || "http://localhost:5001"} roomId={roomId} />
              </div>
            </div>
          )}

          {activeCategory === 'student' && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridAutoRows: "minmax(250px, auto)",
              gap: 24
            }}>
              {/* Note Taker - Full Width (4x2) */}
              <div className="bento-card" style={{ gridColumn: "span 4", gridRow: "span 2", minHeight: 600 }}>
                <NoteTaker />
              </div>

              {/* Study Planner - Wide (2x2) */}
              <div className="bento-card" style={{ gridColumn: "span 2", gridRow: "span 2" }}>
                <StudyPlanner />
              </div>

              {/* Middle Stats - Stacked (1x2) */}
              <div style={{ gridColumn: "span 1", gridRow: "span 2", display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="bento-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: fgMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Sessions</div>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>12</div>
                  <div style={{ fontSize: 12, color: fgMuted, marginTop: 4 }}>Completed this week</div>
                </div>
                <div className="bento-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: fgMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Focus</div>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>92%</div>
                  <div style={{ fontSize: 12, color: fgMuted, marginTop: 4 }}>Efficiency score</div>
                </div>
              </div>

              {/* Resource Hub - Tall (1x2) */}
              <div className="bento-card" style={{ gridColumn: "span 1", gridRow: "span 2" }}>
                <ResourceHub />
              </div>
            </div>
          )}
        </div>

      </main>

      {/* DOCK */}
      <div style={{
        position: "fixed", top: 48, left: "50%", transform: "translateX(-50%)",
        zIndex: 1000, display: "flex", gap: 12, padding: "12px", borderRadius: "24px",
        background: dark ? "rgba(20,20,20,0.8)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)", border: `1px solid ${border}`,
        boxShadow: `0 20px 50px rgba(0,0,0,${dark ? 0.5 : 0.1})`
      }}>
        <div className={`dock-item ${activeCategory === 'dev' ? 'active' : ''}`} onClick={() => setActiveCategory('dev')}>
          <Terminal size={24} /><div className="dock-label">DEVELOPER</div>
        </div>
        <div className={`dock-item ${activeCategory === 'common' ? 'active' : ''}`} onClick={() => setActiveCategory('common')}>
          <Layout size={24} /><div className="dock-label">COMMON</div>
        </div>
        <div className={`dock-item ${activeCategory === 'student' ? 'active' : ''}`} onClick={() => setActiveCategory('student')}>
          <GraduationCap size={24} /><div className="dock-label">STUDENT</div>
        </div>
      </div>
    </div>
  );
}
