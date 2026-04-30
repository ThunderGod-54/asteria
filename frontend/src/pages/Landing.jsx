import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Eye, LayoutDashboard, Sparkles, Check, ArrowRight,
  Zap, Shield, BarChart2, Brain, Moon, Sun, Menu, X, MousePointer2
} from "lucide-react";
import { useTheme } from "../Theme";
import heroImg from "../assets/doodle2.jpeg";
import heroImgLight from "../assets/doodle1.png";

const Noise = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = to / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); }
          else setVal(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function Landing() {
  const nav = useNavigate();
  const { dark, setDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(1);

  const bg = dark ? "#080808" : "#F5F5F0";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

      .fade-up {
        opacity: 0;
        transform: translateY(32px);
        transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
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

      .feature-card {
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        position: relative;
        overflow: hidden;
      }
      .feature-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s;
      }
      .feature-card:hover { transform: translateY(-6px); }
      .feature-card:hover::before { opacity: 1; }

      .plan-card {
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
      }

      .marquee-track {
        display: flex;
        gap: 24px;
        animation: marquee 20s linear infinite;
        width: max-content;
      }
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

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

      html { scroll-behavior: smooth; }
    `;
    document.head.appendChild(style);

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
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

  const features = [
    { icon: <Eye size={22} />, title: "Face Tracking", desc: "MediaPipe-powered gaze, blink, and head pose detection — 30-second signal intervals, zero video stored." },
    { icon: <LayoutDashboard size={22} />, title: "App Intelligence", desc: "Knows the difference between coding in VS Code and scrolling Reddit. Classifies every minute of screen time." },
    { icon: <Brain size={22} />, title: "AI Coach", desc: "Gemini analyzes your session patterns and tells you your peak hours, worst triggers, and optimal break schedule." },
    { icon: <BarChart2 size={22} />, title: "Focus Timeline", desc: "A minute-by-minute heatmap of your entire day — see exactly where you lost the thread." },
    { icon: <Shield size={22} />, title: "100% Local", desc: "All data lives on your machine. Nothing sent to any cloud. Not even a screenshot." },
    { icon: <Zap size={22} />, title: "Instant Nudges", desc: "Desktop alerts the moment you drift — before 5 minutes becomes 50." },
  ];

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "",
      desc: "For curious individuals",
      features: ["Face tracking", "App monitoring", "Daily focus score", "7-day history"],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: "₹499",
      period: "/mo",
      desc: "For serious deep workers",
      features: ["Everything in Free", "AI coaching insights", "PDF reports", "Unlimited history", "Priority support"],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Teams",
      price: "₹999",
      period: "/mo",
      desc: "For remote startups",
      features: ["Everything in Pro", "Team dashboard", "Manager analytics", "Slack integration", "Custom personas"],
      cta: "Contact Us",
    },
  ];

  const testimonials = [
    { quote: "This actually made me productive.", name: "Rishabh R K.", role: "Full-stack Dev" },
    { quote: "Way better than any time tracking app I've tried.", name: "Sammed Patil.", role: "Product Designer" },
    { quote: "Feels like having a personal focus coach.", name: "Samarth Madiwal.", role: "CS Student, GIT" },
  ];

  const stats = [
    { val: 70, suffix: "%", label: "of workers feel unproductive" },
    { val: 23, suffix: "min", label: "average time to regain focus" },
    { val: 3, suffix: "x", label: "productivity gain with tracking" },
  ];

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: bg, color: fg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <Noise />
      <nav style={{
        position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 48px)", maxWidth: 1100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderRadius: 16,
        background: dark ? "rgba(8,8,8,0.85)" : "rgba(245,245,240,0.85)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${border}`,
        zIndex: 1000,
        boxShadow: dark ? "0 4px 40px rgba(0,0,0,0.6)" : "0 4px 40px rgba(0,0,0,0.08)",
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
          ZENITH
        </div>

        <div style={{ display: "flex", gap: 32, fontSize: 14, fontWeight: 500 }}>
          {["features", "pricing", "testimonials"].map(id => (
            <span key={id} onClick={() => scrollTo(id)} style={{ cursor: "pointer", color: fgMuted, textTransform: "capitalize", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = fg}
              onMouseLeave={e => e.target.style.color = fgMuted}>
              {id}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setDark(!dark)} style={{ background: "transparent", border: `1px solid ${border}`, color: fg, borderRadius: 8, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="glow-btn" onClick={() => nav("/dashboard")} style={{
            background: fg, color: bg, border: "none", borderRadius: 10,
            padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            letterSpacing: 0.3,
          }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        position: "relative",
        maxWidth: 1400,
        margin: "0 auto"
      }}>

        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: dark ? 0.04 : 0.06,
          backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        <div style={{
          position: "relative", zIndex: 1, display: "flex",
          width: "100%", alignItems: "center", justifyContent: "space-between",
          flexDirection: "row", gap: 60,
          flexWrap: "wrap-reverse"
        }}>
          {/* Left Visual (Moved from Right) */}
          <div className="fade-up" style={{ flex: 1, minWidth: 350, display: "flex", justifyContent: "center", position: "relative" }}>
            {/* Glow orb */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 400, height: 400, borderRadius: "50%",
              background: dark ? "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" : "radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <img
              src={dark ? heroImg : heroImgLight}
              alt="Zenith Illustration"
              style={{
                width: "100%",
                maxWidth: 500,
                height: "auto",
                objectFit: "contain",
                filter: dark ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" : "drop-shadow(0 20px 40px rgba(0,0,0,0.05))",
                animation: "float 6s ease-in-out infinite"
              }}
            />
          </div>

          {/* Right Content (Moved from Left) */}
          <div style={{ flex: 1, minWidth: 350, textAlign: "right" }}>
            {/* Badge */}
            <div className="fade-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: 999, padding: "6px 16px", fontSize: 12,
              fontWeight: 500, color: fgMuted, marginBottom: 32, letterSpacing: 0.5,
            }}>
              <Sparkles size={12} />
              PRODUCTIVITY & DEVELOPER TOOLS
            </div>

            {/* Headline */}
            <h1 className="fade-up" style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(60px, 10vw, 120px)",
              lineHeight: 0.9, letterSpacing: -1,
              margin: "0 0 8px",
            }}>
              FOCUS,
            </h1>
            <h1 className="fade-up" style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(60px, 10vw, 120px)",
              lineHeight: 0.9, letterSpacing: -1,
              margin: "0 0 32px",
              WebkitTextStroke: `2px ${fg}`,
              color: "transparent",
            }}>
              REIMAGINED
            </h1>

            <p className="fade-up" style={{ fontSize: "clamp(16px, 1.5vw, 19px)", color: fgMuted, maxWidth: 480, margin: "0 0 48px auto", lineHeight: 1.7, fontWeight: 300 }}>
              Real-time webcam + app intelligence that tells you when you're in flow, when you've drifted, and exactly how to fix it.
            </p>

            <div className="fade-up" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button className="glow-btn" onClick={() => nav("/dashboard")} style={{
                background: fg, color: bg, border: "none", borderRadius: 14,
                padding: "16px 36px", fontSize: 16, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                Start Session <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollTo("features")} style={{
                background: "transparent", color: fg, border: `1px solid ${cardBorder}`,
                borderRadius: 14, padding: "16px 36px", fontSize: 16, fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = fg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Live score preview */}
        <div className="fade-up" style={{
          marginTop: 80, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap",
          position: "relative", zIndex: 1,
        }}>

        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "60px 24px", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 40 }}>
          {stats.map((s, i) => (
            <div key={i} className="fade-up" style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1, letterSpacing: -1 }}>
                <Counter to={s.val} suffix={s.suffix} />
              </div>
              <div style={{ color: fgMuted, fontSize: 13, marginTop: 6, maxWidth: 160 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="fade-up" style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: -1, lineHeight: 1 }}>
            EVERYTHING YOU NEED<br />
            <span style={{ WebkitTextStroke: `2px ${fg}`, color: "transparent" }}>TO OWN YOUR FOCUS</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 1, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card fade-up" style={{
              background: cardBg, border: `1px solid ${border}`,
              padding: "36px", cursor: "default",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20, color: fg,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ color: fgMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ overflow: "hidden", padding: "32px 0", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, copy) =>
            ["FOCUS MORE", "DISTRACT LESS", "FLOW DEEPER", "WORK SMARTER", "AI-COACHED", "PRIVACY FIRST", "REAL-TIME", "100% LOCAL"].map((t, i) => (
              <span key={`${copy}-${t}-${i}`} style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 32, letterSpacing: 4,
                color: i % 2 === 0 ? fg : "transparent",
                WebkitTextStroke: i % 2 !== 0 ? `1px ${fg}` : "none",
                whiteSpace: "nowrap", paddingRight: 48,
              }}>
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: -1, lineHeight: 1 }}>
            SIMPLE PRICING
          </div>
          <p style={{ color: fgMuted, fontSize: 16, marginTop: 12 }}>No hidden fees. Cancel anytime.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {plans.map((plan, i) => (
            <div key={i} className="plan-card fade-up"
              onMouseEnter={() => setHoveredPlan(i)}
              style={{
                background: plan.highlight
                  ? fg
                  : cardBg,
                color: plan.highlight ? bg : fg,
                border: `1px solid ${plan.highlight ? fg : cardBorder}`,
                borderRadius: 20, padding: "40px 32px",
                position: "relative", overflow: "hidden",
                transform: hoveredPlan === i ? "translateY(-8px)" : "translateY(0)",
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: plan.highlight
                  ? dark ? "0 20px 60px rgba(255,255,255,0.1)" : "0 20px 60px rgba(0,0,0,0.15)"
                  : "none",
              }}>
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: 20, right: 20,
                  background: bg, color: fg, fontSize: 11,
                  fontWeight: 700, letterSpacing: 1, padding: "4px 12px", borderRadius: 999,
                }}>
                  POPULAR
                </div>
              )}

              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, opacity: 0.5, marginBottom: 8, textTransform: "uppercase" }}>{plan.desc}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 32 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ opacity: 0.5, fontSize: 16 }}>{plan.period}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: plan.highlight ? `${bg}22` : `${fg}11`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button className="glow-btn" onClick={() => nav("/dashboard")} style={{
                width: "100%", padding: "14px",
                background: plan.highlight ? bg : "transparent",
                color: plan.highlight ? fg : fg,
                border: `1px solid ${plan.highlight ? "transparent" : cardBorder}`,
                borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {plan.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <section id="testimonials" style={{ padding: "120px 24px", borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: -1 }}>
              LOVED BY DEEP WORKERS
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="feature-card fade-up" style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 20, padding: "36px", position: "relative",
              }}>
                <div style={{ fontSize: 48, lineHeight: 1, opacity: 0.15, fontFamily: "serif", marginBottom: 16, color: fg }}>"</div>
                <p style={{ fontSize: 17, lineHeight: 1.7, fontWeight: 300, marginBottom: 28, fontStyle: "italic", color: fg }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: fgMuted, fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px" }}>
        <div className="fade-up" style={{
          maxWidth: 900, margin: "0 auto",
          background: fg, color: bg,
          borderRadius: 24, padding: "64px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(${dark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 7vw, 72px)", letterSpacing: -1, lineHeight: 1, marginBottom: 20 }}>
              STOP GUESSING.<br />START KNOWING.
            </div>
            <p style={{ opacity: 0.6, fontSize: 16, marginBottom: 36, fontWeight: 300 }}>Join thousands of developers and students who track their real focus.</p>
            <button className="glow-btn" onClick={() => nav("/dashboard")} style={{
              background: bg, color: fg, border: "none", borderRadius: 14,
              padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              Start for Free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <footer style={{ padding: "40px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2 }}>ZENITH</div>
        <div style={{ color: fgMuted, fontSize: 13 }}>© 2026 Zenith. Built for deep work.</div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: fgMuted }}>
          {["Privacy", "Terms", "GitHub"].map(l => (
            <span key={l} style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = fg}
              onMouseLeave={e => e.target.style.color = fgMuted}>
              {l}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}