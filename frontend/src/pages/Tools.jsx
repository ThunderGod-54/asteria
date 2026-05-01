import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import SketchlyCanvas from "sketchly-canvas";
import CodeEditor from "../components/CodeEditor";
import { 
  GraduationCap, Clock, Music, 
  Terminal, Code, PenTool, 
  FileText, Settings, Share2,
  Sparkles, ArrowRight, ChevronRight,
  Monitor, Layout, Briefcase,
  Layers, Zap, Cpu, BookOpen, Laptop, Globe,
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

function SketchlyMount({ containerRef, roomId, username }) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const root = createRoot(el);
    root.render(
      <SketchlyCanvas
        serverUrl="http://localhost:5000"
        roomId={roomId}
        username={username}
        asHost={false}
      />
    );
    return () => root.unmount();
  }, [roomId, username]);

  return null;
}

export default function Tools({ initialRoomId = null }) {
  const canvasRef = useRef(null);
  const [roomInput, setRoomInput] = useState(initialRoomId || "");
  const [nameInput, setNameInput] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("dev");
  const { dark } = useTheme();

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

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
        transform: translate(-50%, -40px);
      }
      .dock-label {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, -20px);
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
  }, [dark, fg, bg, fgMuted]);

  const handleJoin = (e) => {
    e.preventDefault();
    const room = roomInput.trim();
    const name = nameInput.trim();
    if (!room || !name) return;
    setActiveRoom(room);
    setActiveUser(name);
  };

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <Noise />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 120px", position: "relative", zIndex: 1 }}>
        
        {/* HEADER */}
        <header className="fade-up" style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: fgMuted, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
            <Cpu size={14} /> UTILITY STACK
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 1, margin: 0 }}>
            ZENITH <span style={{ WebkitTextStroke: `1px ${fg}`, color: "transparent" }}>TOOLS</span>
          </h1>
        </header>

        {activeRoom ? (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 24, overflow: "hidden", minHeight: "70vh" }}>
             <div style={{ padding: "16px 24px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>Canvas: {activeRoom}</div>
                <button onClick={() => { setActiveRoom(null); setActiveUser(null); }} style={{ background: "transparent", border: `1px solid ${border}`, color: fg, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>Exit</button>
             </div>
             <div ref={canvasRef} style={{ flex: 1 }}>
                <SketchlyMount containerRef={canvasRef} roomId={activeRoom} username={activeUser} />
             </div>
          </div>
        ) : (
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
                  <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 24, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <Terminal size={18} color={fgMuted} />
                      <h4 style={{ margin: 0, fontSize: 14 }}>Terminal HUD</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: fgMuted }}>Live system activity and resource monitoring placeholder.</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 24, padding: 24 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 24, padding: 32 }}>
                   <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                     <PenTool size={22} />
                   </div>
                   <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sketchly Canvas</h3>
                   <p style={{ color: fgMuted, fontSize: 14, marginBottom: 24 }}>Collaborative real-time whiteboard for brainstorming.</p>
                   <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input placeholder="Name" value={nameInput} onChange={e => setNameInput(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: "rgba(255,255,255,0.05)", color: fg }} />
                      <input placeholder="Room ID" value={roomInput} onChange={e => setRoomInput(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: "rgba(255,255,255,0.05)", color: fg }} />
                      <button type="submit" style={{ padding: "12px", borderRadius: "8px", background: fg, color: bg, border: "none", fontWeight: 700, cursor: "pointer" }}>Join Canvas</button>
                   </form>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 24, padding: 32 }}>
                   <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                     <CalendarIcon size={22} />
                   </div>
                   <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Zenith Calendar</h3>
                   <p style={{ color: fgMuted, fontSize: 14, marginBottom: 24 }}>Schedule your focus blocks and deep work sessions.</p>
                   <button style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: fg, fontWeight: 600 }}>Open Calendar</button>
                </div>
              </div>
            )}

            {activeCategory === 'student' && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {['Pomodoro Timer', 'Focus Music', 'Study Planner'].map((t, i) => (
                  <div key={t} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 24, padding: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t}</h3>
                    <p style={{ color: fgMuted, fontSize: 14 }}>Essential tool for academic focus and session management.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* DOCK */}
      {!activeRoom && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, display: "flex", gap: 12, padding: "12px", borderRadius: "24px",
          background: dark ? "rgba(20,20,20,0.8)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)", border: `1px solid ${border}`,
          boxShadow: `0 20px 50px rgba(0,0,0,${dark ? 0.5 : 0.1})`
        }}>
          <div className={`dock-item ${activeCategory === 'dev' ? 'active' : ''}`} onMouseEnter={() => setActiveCategory('dev')} onClick={() => setActiveCategory('dev')}>
            <Terminal size={24} /><div className="dock-label">DEVELOPER</div>
          </div>
          <div className={`dock-item ${activeCategory === 'common' ? 'active' : ''}`} onMouseEnter={() => setActiveCategory('common')} onClick={() => setActiveCategory('common')}>
            <Layout size={24} /><div className="dock-label">COMMON</div>
          </div>
          <div className={`dock-item ${activeCategory === 'student' ? 'active' : ''}`} onMouseEnter={() => setActiveCategory('student')} onClick={() => setActiveCategory('student')}>
            <GraduationCap size={24} /><div className="dock-label">STUDENT</div>
          </div>
        </div>
      )}
    </div>
  );
}
