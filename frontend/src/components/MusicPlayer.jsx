import React, { useState, useRef } from "react";
import { Play, Pause, Music, ChevronDown } from "lucide-react";
import { useTheme } from "../Theme";

export default function MusicPlayer() {
  const { dark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);

  const tracks = [
    { name: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Rain Ambient", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "White Noise", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { name: "Forest Birds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
  ];

  const fg = dark ? "#FFFFFF" : "#111827";
  const fgMuted = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)";
  const border = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const btnBg = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: fgMuted, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
        <Music size={12} /> Focus Player
      </div>
      
      <audio ref={audioRef} src={tracks[currentTrack].url} loop />

      <div style={{ position: "relative", width: "100%", maxWidth: 140 }}>
        <select 
          value={currentTrack}
          onChange={(e) => {
            setCurrentTrack(parseInt(e.target.value));
            setIsPlaying(false);
          }}
          style={{
            width: "100%",
            background: btnBg,
            color: fg,
            border: `1px solid ${border}`,
            borderRadius: "10px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 600,
            appearance: "none",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s"
          }}
        >
          {tracks.map((t, i) => <option key={i} value={i} style={{ background: dark ? "#111" : "#fff", color: fg }}>{t.name}</option>)}
        </select>
        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5, color: fg }} />
      </div>

      <button 
        onClick={togglePlay}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        style={{ 
          background: fg, color: dark ? "#000" : "#fff", 
          border: "none", borderRadius: "50%", 
          width: 48, height: 48, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: isPlaying ? (dark ? "0 0 20px rgba(255,255,255,0.2)" : "0 0 20px rgba(0,0,0,0.1)") : "none"
        }}
      >
        {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" style={{ marginLeft: 3 }} />}
      </button>
    </div>
  );
}
