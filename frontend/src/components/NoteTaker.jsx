import React, { useState, useEffect } from "react";
import { FileText, Save, Sparkles, Clock, Layout } from "lucide-react";
import { useTheme } from "../Theme";

export default function NoteTaker() {
  const { dark } = useTheme();
  const [note, setNote] = useState(() => {
    const saved = localStorage.getItem("zenith_note");
    return saved || "## Welcome to your Note Taker\n\nStart typing here... This tool supports a distraction-free environment for your academic thoughts.";
  });
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("zenith_note", note);
      setLastSaved(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [note]);

  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const cardBg = dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: fgMuted, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            <FileText size={12} /> SCRATCHPAD
          </div>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Note Taker</h3>
        </div>
        {lastSaved && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: fgMuted, fontWeight: 600 }}>
            <Save size={12} /> Auto-saved at {lastSaved}
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: "relative", borderRadius: 24, overflow: "hidden", border: `1px solid ${border}`, background: cardBg }}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Start writing..."
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
            border: "none",
            padding: 32,
            color: fg,
            fontSize: 16,
            lineHeight: 1.6,
            outline: "none",
            resize: "none",
            fontFamily: "'DM Sans', sans-serif"
          }}
        />

      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ padding: "8px 12px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", fontSize: 12, fontWeight: 600, color: fgMuted }}>
          {note.split(/\s+/).filter(x => x.length > 0).length} Words
        </div>
        <div style={{ padding: "8px 12px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", fontSize: 12, fontWeight: 600, color: fgMuted }}>
          {note.length} Characters
        </div>
      </div>
    </div>
  );
}
