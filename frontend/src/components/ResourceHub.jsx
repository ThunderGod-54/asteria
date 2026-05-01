import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Plus, ExternalLink, Globe, BookOpen, Trash2, Tag } from "lucide-react";
import { useTheme } from "../Theme";

export default function ResourceHub() {
  const { dark } = useTheme();
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem("zenith_resources");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "React Documentation", url: "https://react.dev", category: "Docs" },
      { id: 2, title: "MDN Web Docs", url: "https://developer.mozilla.org", category: "Reference" },
    ];
  });
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    localStorage.setItem("zenith_resources", JSON.stringify(resources));
  }, [resources]);

  const addResource = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    setResources([...resources, { id: Date.now(), title: newTitle, url: newUrl, category: "Link" }]);
    setNewTitle("");
    setNewUrl("");
    setShowAdd(false);
  };

  const deleteResource = (id) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const cardBg = dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: fgMuted, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            <Globe size={12} /> KNOWLEDGE BASE
          </div>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Resource Hub</h3>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          style={{ 
            background: fg, 
            color: dark ? "#000" : "#fff", 
            border: "none", 
            padding: "8px 16px", 
            borderRadius: 12, 
            fontSize: 13, 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            cursor: "pointer" 
          }}
        >
          <Plus size={16} /> Add Link
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addResource} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, background: cardBg, border: `1px solid ${border}`, borderRadius: 16 }}>
          <input 
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${border}`, padding: "8px 0", color: fg, fontSize: 14, outline: "none" }}
          />
          <input 
            type="text"
            placeholder="URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${border}`, padding: "8px 0", color: fg, fontSize: 14, outline: "none" }}
          />
          <button type="submit" style={{ alignSelf: "flex-end", background: fg, color: dark ? "#000" : "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Save Resource
          </button>
        </form>
      )}

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, overflowY: "auto", paddingRight: 4 }}>
        {resources.map(res => (
          <div 
            key={res.id} 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: 12, 
              padding: 16, 
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 16,
              position: "relative",
              transition: "transform 0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: fgMuted }}>
                <BookOpen size={14} />
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{res.category}</span>
              </div>
              <button 
                onClick={() => deleteResource(res.id)}
                style={{ background: "none", border: "none", color: fgMuted, cursor: "pointer", padding: 0 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: fg, lineHeight: 1.4 }}>{res.title}</h4>
            <a 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                marginTop: "auto", 
                display: "flex", 
                alignItems: "center", 
                gap: 6, 
                fontSize: 12, 
                color: fg, 
                textDecoration: "none", 
                fontWeight: 600,
                opacity: 0.8
              }}
            >
              Visit <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
