import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Brain, Eye, Activity, ArrowRight, 
  Sun, Moon, Sparkles, LogOut, Settings, BarChart2, Shield, Zap
} from "lucide-react";
import { useTheme } from "../Theme";
import { getFocusData } from "../services/api";

const Noise = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

export default function Dashboard() {
  const [data, setData] = useState({
    score: 0,
    state: "Loading...",
  });
  const { dark, setDark } = useTheme();
  const nav = useNavigate();

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    getFocusData().then(setData);
    
    // Auto-refresh data every 30 seconds to keep dashboard live
    const interval = setInterval(() => {
      getFocusData().then(setData);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
      .fade-up:nth-child(2) { transition-delay: 0.1s; }
      .fade-up:nth-child(3) { transition-delay: 0.2s; }
      .fade-up:nth-child(4) { transition-delay: 0.3s; }

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

      .stat-card {
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        position: relative;
        overflow: hidden;
      }
      .stat-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s;
      }
      .stat-card:hover { transform: translateY(-6px); }
      .stat-card:hover::before { opacity: 1; }

      .cursor-dot {
        width: 6px; height: 6px;
        background: white;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s;
        mix-blend-mode: difference;
      }
      .cursor-ring {
        width: 32px; height: 32px;
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        transition: all 0.15s ease;
        mix-blend-mode: difference;
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
  }, []);

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <Noise />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>
        
        {/* ── HEADER ── */}
        <header className="fade-up" style={{ marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 500, color: fgMuted, marginBottom: 20, letterSpacing: 0.5 }}>
            <Sparkles size={12} />
            WELCOME BACK, USER
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: -1, lineHeight: 1, margin: 0 }}>
            YOUR FOCUS <span style={{ WebkitTextStroke: `2px ${fg}`, color: "transparent" }}>OVERVIEW</span>
          </h1>
        </header>

        {/* ── STATS GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 64 }}>
          
          <div className="stat-card fade-up" style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "40px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: fg }}>
                <Activity size={22} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: fgMuted, letterSpacing: 1 }}>LIVE SCORE</div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, lineHeight: 1, marginBottom: 8 }}>
              {data.score}
            </div>
            <div style={{ fontSize: 14, color: fgMuted }}>Current Session Focus Level</div>
          </div>

          <div className="stat-card fade-up" style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "40px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: fg }}>
                <LayoutDashboard size={22} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: fgMuted, letterSpacing: 1 }}>CURRENT STATE</div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, marginBottom: 16, height: 80, display: "flex", alignItems: "center" }}>
              {data.state}
            </div>
            <div style={{ fontSize: 14, color: fgMuted }}>Activity Intelligence Detection</div>
          </div>

        </div>

        {/* ── QUICK ACTIONS ── */}
        <section className="fade-up">
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, marginBottom: 32 }}>QUICK ACTIONS</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            
            <button className="glow-btn" onClick={() => nav("/face")} style={{ 
              background: fg, color: bg, border: "none", borderRadius: 16, padding: "24px", 
              textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 
            }}>
              <Eye size={24} />
              <div style={{ fontWeight: 600, fontSize: 18 }}>Start Session</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Enable webcam-based face tracking</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
                LAUNCH <ArrowRight size={14} />
              </div>
            </button>

            <button className="glow-btn" onClick={() => nav("/tracker")} style={{ 
              background: cardBg, color: fg, border: `1px solid ${border}`, borderRadius: 16, padding: "24px", 
              textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 
            }}>
              <Zap size={24} />
              <div style={{ fontWeight: 600, fontSize: 18 }}>App Tracker</div>
              <div style={{ fontSize: 13, color: fgMuted }}>Review your application usage history</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
                EXPLORE <ArrowRight size={14} />
              </div>
            </button>

            <button className="glow-btn" onClick={() => nav("/ai")} style={{ 
              background: cardBg, color: fg, border: `1px solid ${border}`, borderRadius: 16, padding: "24px", 
              textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 
            }}>
              <Brain size={24} />
              <div style={{ fontWeight: 600, fontSize: 18 }}>AI Insights</div>
              <div style={{ fontSize: 13, color: fgMuted }}>Get Gemini-powered focus coaching</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
                ANALYZE <ArrowRight size={14} />
              </div>
            </button>

          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2 }}>ZENITH</div>
        <div style={{ color: fgMuted, fontSize: 13 }}>© 2026 Zenith. Dashboard Interface v1.0</div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: fgMuted }}>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/settings")}>Settings</span>
          <span style={{ cursor: "pointer" }} onClick={() => nav("/")}>Home</span>
        </div>
      </footer>
    </div>
  );
}