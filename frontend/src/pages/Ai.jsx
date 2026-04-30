import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Send, Bot, User, ArrowLeft,
  Trash2, Brain, Zap, Target, History,
  Maximize2, Minimize2, Terminal, Info
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { useTheme } from "../Theme";
import { getSessions } from "../services/sessionStore";

const Noise = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function Ai() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I am your **Zenith AI Coach**. I've analyzed your recent focus patterns. How can I help you optimize your deep work today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Get context from last session
      const sessions = getSessions();
      const lastSession = sessions[0] || {};

      const promptContext = `
        User Question: ${input}
        
        Session Context:
        - Attention Score: ${lastSession.attentionPercent}%
        - Distractions: ${lastSession.tabSwitches}
        - Performance Grade: ${lastSession.grade}
        - Total Duration: ${lastSession.totalDuration}
        
        You are the Zenith AI Coach. Provide a concise, professional, and motivating response using markdown.
      `;

      const result = await model.generateContent(promptContext);
      const responseText = result.response.text();

      setMessages(prev => [...prev, {
        role: "ai",
        content: responseText
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "I'm having trouble connecting to my neural core. Please check your API key in .env." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <Noise />

      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 70, borderBottom: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px 0 180px", background: `${bg}CC`, backdropFilter: "blur(20px)",
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: fg, color: bg, borderRadius: 8, padding: 6, display: "flex" }}>
              <Brain size={20} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1.5 }}>
              ZENITH AI COACH
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "transparent", border: `1px solid ${border}`, color: fgMuted, borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => setMessages([messages[0]])}>
            CLEAR CHAT
          </button>
        </div>
      </header>

      {/* ── CHAT AREA ── */}
      <main
        ref={scrollRef}
        style={{
          maxWidth: 800, margin: "0 auto", padding: "100px 24px 140px",
          marginLeft: "calc(50% - 400px + 140px)", // Increased shift to balance expanded sidebar
          height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 32,
          scrollBehavior: "smooth"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              width: "100%",
              animation: "fadeUp 0.5s ease-out forwards"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: fgMuted, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
              {msg.role === 'ai' ? <><Sparkles size={12} /> ZENITH INTELLIGENCE</> : <><User size={12} /> YOU</>}
            </div>

            <div style={{
              background: msg.role === 'ai' ? cardBg : "transparent",
              border: `1px solid ${msg.role === 'ai' ? border : cardBorder}`,
              borderRadius: 20,
              padding: "16px 24px",
              maxWidth: "85%",
              color: msg.role === 'user' ? fg : fg,
              fontSize: 15,
              lineHeight: 1.6,
              boxShadow: msg.role === 'ai' ? "0 4px 20px rgba(0,0,0,0.1)" : "none"
            }}>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                  code: ({ node, ...props }) => <code style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", padding: "2px 4px", borderRadius: 4 }} {...props} />
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: fgMuted }}>
            <Zap size={14} className="spinning" />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>ANALYZING TELEMETRY...</span>
          </div>
        )}
      </main>

      {/* ── INPUT BAR ── */}
      <div style={{
        position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 48px)", maxWidth: 760, zIndex: 100,
        marginLeft: 160 // Further shift for expanded sidebar symmetry
      }}>
        <form
          onSubmit={handleSend}
          style={{
            background: dark ? "rgba(20,20,20,0.8)" : "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${border}`,
            borderRadius: 24,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}
        >
          <div style={{ padding: "0 12px", color: fgMuted }}>
            <Terminal size={20} />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your focus patterns..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: fg,
              fontSize: 15,
              padding: "12px 0",
              outline: "none",
              fontFamily: "inherit"
            }}
          />
          <button
            type="submit"
            className="glow-btn"
            disabled={!input.trim() || loading}
            style={{
              background: fg,
              color: bg,
              border: "none",
              borderRadius: 16,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              opacity: input.trim() ? 1 : 0.3,
              transition: "all 0.2s"
            }}
          >
            <Send size={20} />
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: fgMuted, letterSpacing: 0.5, fontWeight: 600 }}>
          ZENITH AI CAN MAKE MISTAKES. VERIFY CRITICAL COGNITIVE DATA.
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${border};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
