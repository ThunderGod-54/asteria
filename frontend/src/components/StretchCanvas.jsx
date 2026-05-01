import React from "react";
import { Maximize, PenTool } from "lucide-react";
import { useTheme } from "../Theme";

export default function StretchCanvas() {
  const { dark } = useTheme();
  
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PenTool size={18} color={fg} />
          </div>
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 800, color: fgMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2, margin: 0 }}>Brainstorm</h3>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Stretch Canvas</div>
          </div>
        </div>
        <div style={{ opacity: 0.3 }}><Maximize size={16} /></div>
      </div>

      <div style={{ 
        flex: 1, 
        border: `1px dashed ${border}`, 
        borderRadius: "16px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "rgba(255,255,255,0.01)"
      }}>
        <div style={{ textAlign: "center", opacity: 0.2 }}>
           <PenTool size={32} style={{ marginBottom: 12 }} />
           <div style={{ fontSize: 12, fontWeight: 600 }}>Canvas Interface Placeholder</div>
        </div>
      </div>
    </div>
  );
}
