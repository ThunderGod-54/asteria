const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");
const os = require("os");
const PDFDocument = require("pdfkit");

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 50e6,
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ─── Existing API routes ───────────────────────────────────────────────────

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

app.post("/run-code", (req, res) => {
  const { code, language } = req.body;
  const vm = require("vm");
  const util = require("util");
  const fs = require("fs");
  const path = require("path");
  const { exec } = require("child_process");

  if (language === "javascript") {
    let output = "";
    const customConsole = {
      log: (...args) => { output += args.map(arg => util.inspect(arg)).join(" ") + "\n"; },
      error: (...args) => { output += "ERROR: " + args.map(arg => util.inspect(arg)).join(" ") + "\n"; },
      warn: (...args) => { output += "WARN: " + args.map(arg => util.inspect(arg)).join(" ") + "\n"; }
    };

    try {
      const script = new vm.Script(code);
      const context = vm.createContext({ console: customConsole, ...global });
      script.runInContext(context, { timeout: 1000 });
      res.json({ output: output || "Code executed successfully (no output)." });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  } else {
    // Handle other languages via system exec
    const fileId = uuidv4();
    const tempDir = os.platform() === 'win32' ? path.join(__dirname, "temp") : "/tmp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    let fileName, execCmd;
    if (language === "python") {
      fileName = `${fileId}.py`;
      execCmd = `python ${path.join(tempDir, fileName)}`;
    } else if (language === "cpp") {
      fileName = `${fileId}.cpp`;
      const outName = os.platform() === 'win32' ? `${fileId}.exe` : `${fileId}.out`;
      execCmd = `g++ ${path.join(tempDir, fileName)} -o ${path.join(tempDir, outName)} && ${path.join(tempDir, outName)}`;
    } else if (language === "java") {
      fileName = `Main_${fileId.replace(/-/g, "")}.java`;
      // Java requires class name to match file name
      const className = fileName.replace(".java", "");
      const adjustedCode = code.replace(/public\s+class\s+\w+/, `public class ${className}`);
      fs.writeFileSync(path.join(tempDir, fileName), adjustedCode);
      execCmd = `javac ${path.join(tempDir, fileName)} && java -cp ${tempDir} ${className}`;
    }

    if (!fileName) return res.status(400).json({ error: "Unsupported language" });

    if (language !== "java") {
      fs.writeFileSync(path.join(tempDir, fileName), code);
    }

    exec(execCmd, (err, stdout, stderr) => {
      // Cleanup
      try {
        if (fs.existsSync(path.join(tempDir, fileName))) fs.unlinkSync(path.join(tempDir, fileName));
        const outName = os.platform() === 'win32' ? `${fileId}.exe` : `${fileId}.out`;
        if (language === "cpp" && fs.existsSync(path.join(tempDir, outName))) fs.unlinkSync(path.join(tempDir, outName));
      } catch (e) { }

      if (err) {
        res.status(400).json({ error: stderr || err.message });
      } else {
        res.json({ output: stdout || "Code executed successfully (no output)." });
      }
    });
  }
});

app.post("/api/generate-pdf", (req, res) => {
  console.log("PDF generation request received:", req.body?.date);
  const report = req.body;
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  const fileName = `zenith-report-${report.date.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);

  // --- Design & Layout ---
  const primaryColor = "#0f172a";
  const accentColor = "#3b82f6";
  const mutedColor = "#64748b";

  // Header
  doc.rect(0, 0, 612, 120).fill(primaryColor);
  doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold").text("ZENITH AI", 50, 45);
  doc.fontSize(10).font("Helvetica").text("ASTORIA PROTOCOL // FOCUS INTELLIGENCE", 50, 80, { characterSpacing: 1 });
  doc.fontSize(10).text(new Date().toLocaleString(), 400, 45, { align: "right" });

  // Title
  doc.fillColor(primaryColor).fontSize(20).font("Helvetica-Bold").text("SESSION PERFORMANCE REPORT", 50, 150);
  doc.rect(50, 175, 512, 2).fill(accentColor);

  // Summary Grid
  let y = 200;
  const drawStat = (label, value, x, yPos, highlight = false) => {
    doc.fillColor(mutedColor).fontSize(9).font("Helvetica-Bold").text(label.toUpperCase(), x, yPos);
    doc.fillColor(highlight ? accentColor : primaryColor).fontSize(16).font("Helvetica-Bold").text(value, x, yPos + 15);
  };

  drawStat("Date", report.date, 50, y);
  drawStat("Start Time", report.startTime, 180, y);
  drawStat("End Time", report.endTime, 310, y);
  drawStat("Grade", report.grade, 440, y, true);

  y += 50;
  drawStat("Duration", report.totalDuration, 50, y);
  drawStat("Focused Time", report.focusedTime, 180, y);
  drawStat("Attention", `${report.attentionPercent}%`, 310, y, true);
  drawStat("Distractions", report.tabSwitches, 440, y);

  // Distraction Log
  y += 80;
  doc.fillColor(primaryColor).fontSize(14).font("Helvetica-Bold").text("DISTRACTION TELEMETRY LOG", 50, y);
  y += 20;

  if (report.awayEvents && report.awayEvents.length > 0) {
    // Table Header
    doc.rect(50, y, 512, 20).fill("#f1f5f9");
    doc.fillColor(primaryColor).fontSize(8).font("Helvetica-Bold");
    doc.text("TIME", 60, y + 6);
    doc.text("EVENT / APP", 150, y + 6);
    doc.text("KIND", 400, y + 6);
    doc.text("DURATION", 500, y + 6);
    y += 25;

    report.awayEvents.forEach((ev, i) => {
      if (y > 700) { doc.addPage(); y = 50; }

      const startTime = ev.startTime ? new Date(ev.startTime).toLocaleTimeString() : "—";
      const duration = ev.durationMs ? (ev.durationMs / 1000).toFixed(1) + "s" : "—";

      doc.fillColor(primaryColor).fontSize(9).font("Helvetica");
      doc.text(startTime, 60, y);
      doc.text(ev.label || "Unknown", 150, y, { width: 240 });
      doc.text(ev.kind.toUpperCase(), 400, y);
      doc.text(duration, 500, y);

      y += 20;
      doc.moveTo(50, y - 5).lineTo(562, y - 5).strokeColor("#e2e8f0").lineWidth(0.5).stroke();
    });
  } else {
    doc.fillColor(mutedColor).fontSize(10).font("Helvetica-Oblique").text("No distraction events recorded during this session.", 50, y);
  }

  // Footer
  doc.fontSize(8).fillColor(mutedColor).text("This report was automatically generated by the Zenith AI Focus Monitoring system..", 50, 750, { align: "center", width: 512 });

  doc.end();
});

app.get("/", (req, res) => res.send("🚀 Asteria Backend Running"));

// ─── Sketchly Canvas Socket.io ─────────────────────────────────────────────

const rooms = {};

function getRoom(roomId) {
  if (!rooms[roomId]) rooms[roomId] = { shapes: [], users: {}, markers: [] };
  return rooms[roomId];
}

function randomColor() {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

app.get("/room/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId);
  res.json({ shapes: room.shapes, userCount: Object.keys(room.users).length });
});

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  socket.on("join-room", ({ roomId, username }) => {
    const room = getRoom(roomId);
    if (Object.keys(room.users).length >= 10) { socket.emit("room-full"); return; }
    currentRoom = roomId;
    currentUser = { id: socket.id, username: username || `User-${socket.id.slice(0, 4)}`, color: randomColor() };
    socket.join(roomId);
    room.users[socket.id] = currentUser;
    socket.emit("room-state", { shapes: room.shapes, users: Object.values(room.users), markers: room.markers });
    socket.to(roomId).emit("user-joined", currentUser);
    io.to(roomId).emit("users-update", Object.values(room.users));
  });

  socket.on("cursor-move", ({ x, y }) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit("cursor-update", { userId: socket.id, x, y, ...currentUser });
  });

  socket.on("shape-add", (shape) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    if (!shape.id) shape.id = uuidv4();
    room.shapes.push(shape);
    socket.to(currentRoom).emit("shape-add", shape);
  });

  socket.on("shape-update", (shape) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    const idx = room.shapes.findIndex((s) => s.id === shape.id);
    if (idx !== -1) room.shapes[idx] = shape;
    socket.to(currentRoom).emit("shape-update", shape);
  });

  socket.on("shape-delete", (shapeId) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.shapes = room.shapes.filter((s) => s.id !== shapeId);
    socket.to(currentRoom).emit("shape-delete", shapeId);
  });

  socket.on("canvas-clear", () => {
    if (!currentRoom) return;
    getRoom(currentRoom).shapes = [];
    io.to(currentRoom).emit("canvas-clear");
  });

  socket.on("draw-stroke", (stroke) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit("draw-stroke", stroke);
  });

  socket.on("marker-add", (marker) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.markers.push(marker);
    socket.to(currentRoom).emit("marker-add", marker);
  });

  socket.on("marker-update", (marker) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    const idx = room.markers.findIndex((m) => m.id === marker.id);
    if (idx !== -1) room.markers[idx] = marker;
    socket.to(currentRoom).emit("marker-update", marker);
  });

  socket.on("marker-delete", (id) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.markers = room.markers.filter((m) => m.id !== id);
    socket.to(currentRoom).emit("marker-delete", id);
  });

  socket.on("voice-join", () => { if (currentRoom) socket.to(currentRoom).emit("voice-user-joined", { userId: socket.id, ...currentUser }); });
  socket.on("voice-offer", ({ to, offer }) => { io.to(to).emit("voice-offer", { from: socket.id, offer }); });
  socket.on("voice-answer", ({ to, answer }) => { io.to(to).emit("voice-answer", { from: socket.id, answer }); });
  socket.on("voice-ice", ({ to, candidate }) => { io.to(to).emit("voice-ice", { from: socket.id, candidate }); });
  socket.on("voice-leave", () => { if (currentRoom) socket.to(currentRoom).emit("voice-user-left", { userId: socket.id }); });

  // ─── OS-LEVEL DISTRACTION TRACKING ───
  socket.on("tab-hidden", () => {
    console.log("Tab hidden event received, emitting distraction-alert");
    // Simply emit a distraction-alert event to the client
    socket.emit("distraction-alert", {
      message: "Stay focused! You just switched away from your work."
    });
    socket.emit("distraction-log", { app: "Other Tab/App" });
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    const room = rooms[currentRoom];
    if (room) {
      delete room.users[socket.id];
      io.to(currentRoom).emit("user-left", socket.id);
      io.to(currentRoom).emit("users-update", Object.values(room.users));
    }
  });
});
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zenith AI | API Status</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: radial-gradient(circle at top left, #0f172a, #000000); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; color: white; }
            .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 3rem; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
            .status-dot { height: 12px; width: 12px; background-color: #22c55e; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 15px #22c55e; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        </style>
    </head>
    <body>
        <div class="glass max-w-md w-full mx-4">
            <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Zenith AI</h1>
            <p class="text-gray-400 mb-8">Asteria Protocol Backend</p>
            
            <div class="bg-black/40 rounded-xl p-4 mb-6 flex items-center justify-center border border-white/5">
                <span class="status-dot"></span>
                <span class="font-mono text-green-400 uppercase tracking-widest text-sm">System Operational</span>
            </div>

            <div class="space-y-3">
                <a href="https://zenithaiapp2026.web.app/" class="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 transition-all rounded-lg font-medium">Open Frontend App</a>
                <p class="text-xs text-gray-500 mt-6">Version 1.0.0-stable • Node.js Environment</p>
            </div>
        </div>
    </body>
    </html>
  `);
});
// ─── Start ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));