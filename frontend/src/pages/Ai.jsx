import { useState } from "react";
import { getAIInsights } from "../services/api";

export default function Ai() {
  const [insight, setInsight] = useState("");

  const generate = async () => {
    const res = await getAIInsights({
      focus: "low",
      apps: ["YouTube"],
    });

    setInsight(res.message);
  };

  return (
    <div className="container">
      <h2>AI Coach</h2>

      <button onClick={generate}>Generate Insight</button>

      <div className="card">
        <p>{insight}</p>
      </div>
    </div>
  );
}
