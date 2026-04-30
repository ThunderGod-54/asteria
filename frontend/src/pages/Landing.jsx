import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import heroImg from "../assets/doodle2.jpeg";
import heroImgLight from "../assets/doodle1.png";

export default function Landing() {
  const nav = useNavigate();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("show");
        });
      },
      { threshold: 0.2 },
    );

    document.querySelectorAll(".fade").forEach((el) => observer.observe(el));
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        ...styles.container,
        background: dark ? "#000" : "#fff",
        color: dark ? "#fff" : "#000",
      }}
    >
      {/* NAVBAR */}
      <div style={styles.nav}>
        <h2 style={{ cursor: "pointer" }}>Zenith</h2>

        <div style={styles.navLinks}>
          <span onClick={() => scrollTo("features")}>Features</span>
          <span onClick={() => scrollTo("pricing")}>Pricing</span>
          <span onClick={() => scrollTo("testimonials")}>Testimonials</span>
        </div>

        <div style={styles.actions}>
          {/* SVG THEME TOGGLE */}
          <button style={styles.toggle} onClick={() => setDark(!dark)}>
            {dark ? (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <circle cx="10" cy="10" r="3.5" />

                {/* Vertical */}
                <line x1="10" y1="0" x2="10" y2="3" />
                <line x1="10" y1="17" x2="10" y2="20" />

                {/* Horizontal */}
                <line x1="0" y1="10" x2="3" y2="10" />
                <line x1="17" y1="10" x2="20" y2="10" />

                {/* Diagonals */}
                <line x1="3" y1="3" x2="5" y2="5" />
                <line x1="15" y1="15" x2="17" y2="17" />
                <line x1="3" y1="17" x2="5" y2="15" />
                <line x1="15" y1="5" x2="17" y2="3" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button style={styles.cta} onClick={() => nav("/dashboard")}>
            Get Started
          </button>
        </div>
      </div>

      {/* HERO */}
      <section style={styles.hero} className="fade">
        {/* LEFT */}
        <div style={styles.heroLeft}>
          <h1 style={styles.title}>Focus, Reimagined</h1>
          <p style={styles.subtitle}>
            Stop guessing. Start measuring real attention.
          </p>

          <button style={styles.primaryBtn} onClick={() => nav("/dashboard")}>
            Start Session
          </button>
        </div>

        {/* RIGHT IMAGE */}
        <div style={styles.heroRight}>
          <img
            src={dark ? heroImg : heroImgLight}
            alt="hero"
            style={styles.heroImg}
            className="pop"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <h2 className="fade">Features</h2>

        <div style={styles.grid}>
          {[
            ["Face Tracking", "Real-time attention detection"],
            ["App Tracking", "Track meaningful usage"],
            ["AI Insights", "Smart focus improvements"],
          ].map(([title, desc], i) => (
            <div key={i} style={styles.card} className="fade">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={styles.section}>
        <h2 className="fade">Pricing</h2>

        <div style={styles.grid}>
          <div style={styles.card} className="fade">
            <h3>Free</h3>
            <p>Basic tracking</p>
            <h1>₹0</h1>
          </div>

          <div style={styles.cardHighlight} className="fade">
            <h3>Pro</h3>
            <p>AI insights + reports</p>
            <h1>₹499/mo</h1>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={styles.section}>
        <h2 className="fade">Loved by creators</h2>

        <div style={styles.grid}>
          {[
            "This actually made me productive.",
            "Way better than time tracking apps.",
            "Feels like having a focus coach.",
          ].map((t, i) => (
            <div key={i} style={styles.card} className="fade">
              <p>"{t}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2026 Zenith. Built for deep work.</p>
      </footer>

      {/* ANIMATIONS */}
      <style>{`
      .pop {
  animation: popIn 0.4s ease;
}

@keyframes popIn {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
        .fade {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s ease;
        }

        .fade.show {
          opacity: 1;
          transform: translateY(0);
        }

        span:hover {
          opacity: 0.6;
          cursor: pointer;
        }

        button:hover {
          transform: scale(1.05);
          transition: 0.2s ease;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
    transition: "0.3s",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "14px 30px",
    margin: "0px auto",
    width: "100%",
    maxWidth: "1456px",

    position: "sticky",
    top: "20px",
    zIndex: 1000,

    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",

    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "14px",

    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  },

  navLinks: {
    display: "flex",
    gap: "30px",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  toggle: {
    background: "transparent",
    border: "0px solid",
    padding: "8px",
    cursor: "pointer",
    borderRadius: "6px",
  },

  cta: {
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "10px 18px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "100px 80px",
    gap: "40px",
    flexWrap: "wrap",
  },

  heroLeft: {
    flex: 1,
    minWidth: "300px",
  },

  heroRight: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },

  heroImg: {
    width: "100%",
    maxWidth: "450px",
    objectFit: "contain",
  },

  title: {
    fontSize: "72px",
    margin: 0,
    lineHeight: "1.1",
  },

  subtitle: {
    opacity: 0.7,
    margin: "20px 0",
    fontSize: "18px",
  },

  primaryBtn: {
    padding: "14px 30px",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  section: {
    marginTop: "150px",
    textAlign: "center",
  },

  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginTop: "40px",
    flexWrap: "wrap",
  },

  card: {
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "30px",
    width: "240px",
    borderRadius: "12px",
  },

  cardHighlight: {
    border: "2px solid white",
    padding: "30px",
    width: "260px",
    borderRadius: "12px",
  },

  footer: {
    marginTop: "150px",
    textAlign: "center",
    padding: "40px",
    opacity: 0.6,
  },
};