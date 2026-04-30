import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFocusData } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    score: 0,
    state: "Loading...",
  });

  const nav = useNavigate();

  useEffect(() => {
    getFocusData().then(setData);
  }, []);

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div style={styles.grid}>
        <div className="card">
          <h3>Focus Score</h3>
          <p style={styles.big}>{data.score}</p>
        </div>

        <div className="card">
          <h3>Current State</h3>
          <p style={styles.big}>{data.state}</p>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={() => nav("/face")}>Start Face Tracking</button>

        <button onClick={() => nav("/tracker")}>View App Tracker</button>

        <button onClick={() => nav("/ai")}>Get AI Insights</button>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  big: {
    fontSize: "40px",
    margin: 0,
  },
  actions: {
    marginTop: "30px",
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
};
