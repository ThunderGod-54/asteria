const express = require("express");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());
app.get("/api/focus", (req, res) => {
  const states = ["Focused", "Distracted", "Stuck", "Fatigued"];

  res.json({
    score: Math.floor(Math.random() * 40) + 60,
    state: states[Math.floor(Math.random() * states.length)],
    timestamp: new Date().toLocaleTimeString(),
  });
});
app.post("/api/ai", (req, res) => {
  const { focus, apps } = req.body;

  const responses = [
    "You're doing great. Stay consistent.",
    "You're getting distracted. Try blocking YouTube.",
    "Take a short break. You're showing fatigue.",
    "Switch tasks to regain focus.",
  ];

  res.json({
    input: { focus, apps },
    message: responses[Math.floor(Math.random() * responses.length)],
  });
});

app.get("/api/apps", (req, res) => {
  res.json([
    { name: "VS Code", time: "2h 10m" },
    { name: "Chrome", time: "1h 30m" },
    { name: "YouTube", time: "45m" },
  ]);
});

app.get("/api/face", (req, res) => {
  const states = ["Looking", "Away", "Sleeping"];

  res.json({
    face: states[Math.floor(Math.random() * states.length)],
    confidence: (Math.random() * 100).toFixed(2),
  });
});

app.get("/", (req, res) => {
  res.send("🚀 Zenith Backend Running");
});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
