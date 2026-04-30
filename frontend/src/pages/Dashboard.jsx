import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Brain, Eye, Activity, ArrowRight,
  Sun, Moon, Sparkles, LogOut, Settings, BarChart2, 
  Shield, Zap, Clock, TrendingUp, AlertCircle, History,
  RefreshCw, Quote
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useTheme } from "../Theme";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { getSessions } from "../services/sessionStore";

const Noise = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

const Skeleton = ({ width = "100%", height = "20px", borderRadius = "8px" }) => (
  <div style={{ 
    width, height, borderRadius, 
    background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite linear"
  }} />
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    avgAttention: 0,
    totalSessions: 0,
    totalDistractions: 0,
    peakFocus: 0
  });
  const [user, setUser] = useState(null);
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const { dark, setDark } = useTheme();

  const thoughts = [
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" }
  ];

  const nextThought = () => setThoughtIdx((thoughtIdx + 1) % thoughts.length);
  const nav = useNavigate();

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      fetchData(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (currentUser) => {
    setLoading(true);
    let allSessions = [];

    if (currentUser) {
      try {
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        allSessions = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      } catch (e) {
        console.error("Firestore Error:", e);
        allSessions = getSessions(); // Fallback to local
      }
    } else {
      allSessions = getSessions();
    }

    setSessions(allSessions);
    
    // Calculate Stats
    if (allSessions.length > 0) {
      const avg = Math.round(allSessions.reduce((a, b) => a + (b.attentionPercent || 0), 0) / allSessions.length);
      const dist = allSessions.reduce((a, b) => a + (b.tabSwitches || 0) + (b.noFaceAlerts || 0), 0);
      const peak = Math.max(...allSessions.map(s => s.attentionPercent || 0));
      
      setStats({
        avgAttention: avg,
        totalSessions: allSessions.length,
        totalDistractions: dist,
        peakFocus: peak
      });
    }
    
    setLoading(false);
  };

  const chartData = sessions.slice(0, 7).reverse().map(s => ({
    name: s.date?.split(',')[0] || 'Session',
    focus: s.attentionPercent || 0
  }));

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", overflowX: "hidden" }}>
      <Noise />
      
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: fgMuted, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
              <LayoutDashboard size={14} /> INTELLIGENCE HUB
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 1, margin: 0 }}>
              WELCOME BACK, <span style={{ WebkitTextStroke: `1px ${fg}`, color: "transparent" }}>{user?.displayName?.split(' ')[0] || "OPERATOR"}</span>
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
             <div style={{ fontSize: 13, color: fgMuted }}>Status</div>
             <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
               <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} /> SYSTEM ACTIVE
             </div>
          </div>
        </header>

        {/* BENTO GRID */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gridAutoRows: "minmax(160px, auto)",
          gap: 24 
        }}>
          
          {/* Main Chart - Large 3x2 */}
          <div style={{ 
            gridColumn: "span 3", gridRow: "span 2",
            background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 24, padding: 32,
            display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Attention Flow</h3>
                <div style={{ fontSize: 24, fontWeight: 700 }}>Weekly Performance</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>7 Days</div>
              </div>
            </div>
            
            <div style={{ flex: 1, width: "100%", minHeight: 250 }}>
              {loading ? <Skeleton height="100%" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={fg} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={fg} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
                    <XAxis dataKey="name" stroke={fgMuted} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke={fgMuted} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, fontSize: 12 }}
                      itemStyle={{ color: fg }}
                    />
                    <Area type="monotone" dataKey="focus" stroke={fg} strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Stats Card - Avg Attention */}
          <div style={{ 
            gridColumn: "span 1",
            background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 24, padding: 24,
            display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}>
            <div style={{ background: "rgba(255,255,255,0.05)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Avg Focus</div>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif" }}>
                {loading ? <Skeleton width="60px" /> : `${stats.avgAttention}%`}
              </div>
            </div>
          </div>

          {/* Stats Card - Total Sessions */}
          <div style={{ 
            gridColumn: "span 1",
            background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 24, padding: 24,
            display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}>
            <div style={{ background: "rgba(255,255,255,0.05)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Sessions</div>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif" }}>
                {loading ? <Skeleton width="60px" /> : stats.totalSessions}
              </div>
            </div>
          </div>

          {/* Activity Breakdown - 2x2 */}
          <div style={{ 
            gridColumn: "span 2", gridRow: "span 2",
            background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 24, padding: 32,
            display: "flex", flexDirection: "column"
          }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>Distraction Analytics</h3>
            <div style={{ flex: 1 }}>
              {loading ? <Skeleton height="100%" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions.slice(0, 5).map(s => ({ name: 'S', d: (s.tabSwitches || 0) + (s.noFaceAlerts || 0) }))}>
                    <Bar dataKey="d" radius={[4, 4, 0, 0]}>
                      {sessions.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? fg : fgMuted} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Distraction Surge</div>
              <p style={{ color: fgMuted, fontSize: 12, margin: 0 }}>You averaged {Math.round(stats.totalDistractions / (stats.totalSessions || 1))} distractions per session.</p>
            </div>
          </div>

          {/* Quick Action - 2x1 */}
          <div 
            onClick={() => nav("/face")}
            style={{ 
              gridColumn: "span 2",
              background: fg, color: bg, borderRadius: 24, padding: 32,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.6, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Deep Work</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif" }}>Start New Session</div>
            </div>
            <div style={{ background: bg, color: fg, width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowRight size={24} />
            </div>
          </div>

          {/* Thoughts Card - 2x1 */}
          <div style={{ 
            gridColumn: "span 2",
            background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 24, padding: 32,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Quote size={16} />
              </div>
              <button 
                onClick={nextThought}
                style={{ background: "transparent", border: "none", color: fgMuted, cursor: "pointer", padding: 4 }}
                className="rotate-hover"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            
            <div style={{ zIndex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.5, margin: "16px 0 8px", fontStyle: "italic" }}>
                "{thoughts[thoughtIdx].text}"
              </p>
              <div style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 1 }}>
                — {thoughts[thoughtIdx].author.toUpperCase()}
              </div>
            </div>

            {/* Decorative background icon */}
            <Quote size={80} style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.03, transform: "rotate(15deg)" }} />
          </div>

        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .rotate-hover {
          transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .rotate-hover:hover {
          transform: rotate(180deg);
          color: ${fg} !important;
        }
        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
