import { useState } from "react";

export default function AppTracker() {
  const [apps, setApps] = useState([]);

  const simulateTracking = () => {
    setApps(["VS Code", "Chrome", "YouTube"]);
  };

  return (
    <div className="container">
      <h2>App Tracker</h2>

      <button onClick={simulateTracking}>Start Tracking</button>

      <div className="card">
        {apps.map((app, i) => (
          <p key={i}>{app}</p>
        ))}
      </div>
    </div>
  );
}
