import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Send, Bot, User, ArrowLeft, ArrowUp,
  Trash2, Brain, Zap, Target, History,
  Maximize2, Minimize2, Terminal, Info, Mic,
  Volume2, VolumeX
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
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const speak = (text) => {
    if (isMuted) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    // Strip markdown for cleaner speech
    const cleanText = text.replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    const voices = synth.getVoices();
    const naturalVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural"));
    if (naturalVoice) utterance.voice = naturalVoice;
    synth.speak(utterance);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      clearTimeout(silenceTimerRef.current);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        // Only use final results to avoid duplicate/accumulating text
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(finalTranscript);
          // Auto-send after 1.5s of silence
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            recognition.stop();
          }, 1500);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Trigger send if there's text in the input
        setInput(prev => {
          if (prev.trim()) {
            setTimeout(() => handleSend(), 0);
          }
          return prev;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

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
    if (loading) return;

    // Capture current input value directly
    const currentInput = input.trim();
    if (!currentInput) return;

    const userMsg = { role: "user", content: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Get context from last session
      const sessions = getSessions();
      const lastSession = sessions[0] || {};

      const promptContext = `
        User Question: ${currentInput}
        
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
      speak(responseText);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "I'm having trouble connecting to my neural core. Please check your API key in .env." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: bg,
      color: fg,
      height: "100vh",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      <Noise />

      {/* ── HEADER ── */}
      <header style={{
        height: 70, borderBottom: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", background: `${bg}CC`, backdropFilter: "blur(20px)",
        zIndex: 100,
        flexShrink: 0
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
          <button 
            style={{ background: "transparent", border: `1px solid ${border}`, color: fgMuted, borderRadius: 10, padding: 8, cursor: "pointer", display: "flex", alignItems: "center" }} 
            onClick={() => {
              setIsMuted(!isMuted);
              window.speechSynthesis.cancel();
            }}
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button style={{ background: "transparent", border: `1px solid ${border}`, color: fgMuted, borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => setMessages([messages[0]])}>
            CLEAR CHAT
          </button>
        </div>
      </header>

      {/* ── CHAT AREA ── */}
      <main
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          scrollBehavior: "smooth",
          padding: "40px 24px"
        }}
      >
        <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
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
        </div>
      </main>

      {/* ── INPUT BAR ── */}
      <div style={{
        padding: "20px 24px 40px",
        width: "100%",
        zIndex: 100,
        flexShrink: 0
      }}>
        <form
          onSubmit={handleSend}
          style={{
            maxWidth: 760,
            margin: "0 auto",
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
            type="button"
            onClick={toggleListening}
            style={{
              background: "transparent",
              border: "none",
              color: isListening ? "#ff4b4b" : fgMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              transition: "all 0.3s"
            }}
          >
            <Mic size={24} className={isListening ? "listening" : ""} />
          </button>

          <button
            type="submit"
            className="glow-btn"
            disabled={!input.trim() || loading}
            style={{
              background: fg,
              color: bg,
              border: "none",
              borderRadius: "35%",
              width: 54,
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              opacity: input.trim() ? 1 : 0.3,
              transition: "all 0.2s"
            }}
          >
            <ArrowUp size={36} strokeWidth={3} />
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
        .listening {
          color: #ff4b4b !important;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
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
