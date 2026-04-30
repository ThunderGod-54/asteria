import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import SketchlyCanvas from "sketchly-canvas";

function SketchlyMount({ containerRef, roomId, username }) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const root = createRoot(el);
    root.render(
      <SketchlyCanvas
        serverUrl="http://localhost:5000"
        roomId={roomId}
        username={username}
        asHost={false}
      />
    );
    return () => root.unmount();
  }, [roomId, username]);

  return null;
}

export default function Tools({ initialRoomId = null }) {
  const canvasRef = useRef(null);
  const [roomInput, setRoomInput] = useState(initialRoomId || "");
  const [nameInput, setNameInput] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  // Auto-join if a roomId was passed via URL
  useEffect(() => {
    if (initialRoomId && nameInput.trim()) {
      setActiveRoom(initialRoomId);
      setActiveUser(nameInput.trim());
    }
  }, [initialRoomId]);

  const handleJoin = (e) => {
    e.preventDefault();
    const room = roomInput.trim();
    const name = nameInput.trim();
    if (!room || !name) return;
    setActiveRoom(room);
    setActiveUser(name);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "1rem", gap: "1rem", boxSizing: "border-box" }}>
      <h2 style={{ margin: 0 }}>Tools</h2>

      {/* Sketchly Canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", minHeight: 0 }}>
        {!activeRoom ? (
          // Room entry screen
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)" }}>
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: 360, padding: "32px", background: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sketchly Canvas</h3>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.5 }}>Collaborative real-time whiteboard</p>

              <input
                placeholder="Your name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                maxLength={24}
                style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" }}
              />
              <input
                placeholder="Room ID (e.g. my-room-123)"
                value={roomInput}
                onChange={e => setRoomInput(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" }}
              />
              <button type="submit" style={{ padding: "11px", borderRadius: "8px", background: "#0070f3", color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Join Canvas
              </button>
            </form>
          </div>
        ) : (
          // Canvas mounted in isolated root
          <div ref={canvasRef} style={{ flex: 1, height: "100%" }}>
            <SketchlyMount containerRef={canvasRef} roomId={activeRoom} username={activeUser} />
          </div>
        )}
      </div>

      <div className="card">
        <p>Pomodoro Timer (Coming)</p>
      </div>

      <div className="card">
        <p>Focus Music (Coming)</p>
      </div>
    </div>
  );
}
