import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useTheme } from "../Theme";

export default function Pomodoro() {
  const { dark } = useTheme();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const fg = dark ? "#FFFFFF" : "#111827";
  const fgMuted = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)";
  const border = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const btnBg = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  const setTime = (mins) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(minutes);

  const handleManualSet = (e) => {
    e.preventDefault();
    const val = parseInt(editMinutes);
    if (!isNaN(val) && val > 0 && val < 1000) {
      setMinutes(val);
      setSeconds(0);
      setIsActive(false);
    }
    setIsEditing(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: fgMuted, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
        <Clock size={12} /> Pomodoro
      </div>

      <div style={{ display: "flex", gap: 6, background: btnBg, padding: 4, borderRadius: 8, border: `1px solid ${border}` }}>
        <button onClick={() => setTime(25)} style={{ background: minutes === 25 ? (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)") : "transparent", color: fg, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>FOCUS</button>
        <button onClick={() => setTime(5)} style={{ background: minutes === 5 ? (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)") : "transparent", color: fg, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>SHORT</button>
        <button onClick={() => setTime(15)} style={{ background: minutes === 15 ? (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)") : "transparent", color: fg, border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>LONG</button>
      </div>

      {isEditing ? (
        <form onSubmit={handleManualSet}>
          <input 
            autoFocus
            type="number"
            value={editMinutes}
            onChange={(e) => setEditMinutes(e.target.value)}
            onBlur={handleManualSet}
            style={{ 
              fontSize: 44, 
              fontWeight: 700, 
              fontFamily: "'Bebas Neue', sans-serif", 
              width: 100, 
              textAlign: "center", 
              background: "transparent", 
              border: "none", 
              color: fg, 
              outline: "none" 
            }}
          />
        </form>
      ) : (
        <div 
          onClick={() => { setIsEditing(true); setEditMinutes(minutes); }}
          title="Click to manually set time"
          style={{ fontSize: 44, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: fg, cursor: "pointer" }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button 
          onClick={toggle}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          style={{ background: fg, color: dark ? "#000" : "#fff", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: dark ? "0 4px 12px rgba(255,255,255,0.1)" : "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          {isActive ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
        <button 
          onClick={reset}
          onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = btnBg}
          style={{ background: btnBg, color: fg, border: `1px solid ${border}`, borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
          <RotateCcw size={22} />
        </button>
      </div>
    </div>
  );
}
