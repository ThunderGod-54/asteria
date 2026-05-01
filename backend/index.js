const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const { exec } = require("child_process");
const notifier = require("node-notifier");

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 50e6,
});

app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
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
  const { code } = req.body;
  const vm = require("vm");
  const util = require("util");
  
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
    // Small delay to ensure the OS registers the new active window
    setTimeout(() => {
      const psScript = `(Get-Process | Where-Object {$_.MainWindowHandle -ne 0} | Sort-Object LastProcessorTime -Descending | Select-Object -First 1).ProcessName`;
      exec(`powershell "${psScript}"`, (err, stdout) => {
        if (err) return;
        const appName = stdout.trim();

        // Skip browser processes and empty names
        const browsers = ['brave', 'chrome', 'msedge', 'firefox', 'opera', 'zenith'];
        const isBrowser = browsers.some(b => appName.toLowerCase().includes(b));

        if (appName && !isBrowser) {
          notifier.notify({
            title: 'Zenith Focus Warning',
            message: `You just opened ${appName.toUpperCase()}! Stay focused.`,
            sound: true,
            wait: true
          });
          socket.emit("distraction-log", { app: appName });
        } else if (appName && isBrowser) {
          // User just switched tabs but stayed in browser
          socket.emit("distraction-log", { app: "Other Browser Tab" });
        }
      });
    }, 1200);
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

// ─── Start ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
