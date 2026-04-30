import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFocusData } from "../services/api";

import logoDark from "../assets/logo_black.png";
import logoLight from "../assets/logo_white.png";

export default function Dashboard() {
  const [data, setData] = useState({
    score: 0,
    state: "Loading...",
  });

  const [isDark, setIsDark] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    getFocusData().then(setData);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(media.matches);

    const handler = (e) => setIsDark(e.matches);
    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }, []);

  const logo = isDark ? logoDark : logoLight;

  return (
    <div className="container">

      {/* 🔥 HEADER */}
      <div style={styles.header}>
        <img src={logo} alt="Zenith Logo" style={styles.logo} />
        <h1 style={styles.title}>Zenith</h1>
      </div>

      <h2 style={styles.subheading}>Dashboard</h2>

      {/* 📊 CARDS */}
      <div style={styles.grid}>
        <div className="card" style={styles.card}>
          <div style={styles.cardHeader}>
            <img src={logo} style={styles.cardLogo} />
            <span>Zenith</span>
          </div>
          <h3>Focus Score</h3>
          <p style={styles.big}>{data.score}</p>
        </div>

        <div className="card" style={styles.card}>
          <div style={styles.cardHeader}>
            <img src={logo} style={styles.cardLogo} />
            <span>Zenith</span>
          </div>
          <h3>Current State</h3>
          <p style={styles.big}>{data.state}</p>
        </div>
      </div>

      {/* 🚀 ACTIONS */}
      <div style={styles.actions}>
        <button style={styles.btn} onClick={() => nav("/face")}>
          <img src={logo} style={styles.btnLogo} />
          Start Tracking
        </button>

        <button style={styles.btn} onClick={() => nav("/tracker")}>
          <img src={logo} style={styles.btnLogo} />
          App Tracker
        </button>

        <button style={styles.btn} onClick={() => nav("/ai")}>
          <img src={logo} style={styles.btnLogo} />
          AI Insights
        </button>
      </div>

      {/* 👇 FOOTER */}
      <div style={styles.footer}>
        <img src={logo} style={styles.footerLogo} />
        <span>Zenith © 2026</span>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  logo: {
    width: "45px",
  },

  title: {
    fontSize: "30px",
    fontWeight: "800",
    margin: 0,
  },

  subheading: {
    marginBottom: "20px",
  },

  grid: {
    display: "flex",
    gap: "20px",
  },

  card: {
    flex: 1,
    padding: "20px",
    borderRadius: "12px",
    background: "#1e1e1e",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontWeight: "600",
  },

  cardLogo: {
    width: "18px",
  },

  big: {
    fontSize: "40px",
    margin: 0,
  },

  actions: {
    marginTop: "30px",
    display: "flex",
    gap: "15px",
  },

  btn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },

  btnLogo: {
    width: "16px",
  },

  footer: {
    marginTop: "50px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    opacity: 0.7,
    justifyContent: "center",
  },

  footerLogo: {
    width: "18px",
  },
};