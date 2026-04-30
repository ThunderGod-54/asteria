import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Zenith</h1>
        <p style={styles.subtitle}>
          Measure your real focus. Not just screen time.
        </p>

        <button style={styles.button} onClick={() => nav("/dashboard")}>
          Start Session
        </button>
      </div>

      <div style={styles.features}>
        <div style={styles.card}>
          <h3>Face Tracking</h3>
          <p>Detect real attention using webcam signals</p>
        </div>

        <div style={styles.card}>
          <h3>App Tracking</h3>
          <p>Understand where your time actually goes</p>
        </div>

        <div style={styles.card}>
          <h3>AI Insights</h3>
          <p>Get smart suggestions to improve focus</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    textAlign: "center",
    marginBottom: "50px",
  },
  title: {
    fontSize: "64px",
    margin: 0,
  },
  subtitle: {
    opacity: 0.7,
    margin: "10px 0 20px",
  },
  button: {
    padding: "12px 25px",
    background: "#fff",
    color: "#000",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  features: {
    display: "flex",
    gap: "20px",
  },
  card: {
    border: "1px solid white",
    padding: "20px",
    width: "200px",
    textAlign: "center",
  },
};
