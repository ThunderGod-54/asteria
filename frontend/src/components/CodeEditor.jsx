import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Copy, Terminal, Check } from "lucide-react";
import { useTheme } from "../Theme";

export default function CodeEditor() {
  const { dark } = useTheme();
  const [code, setCode] = useState("// Zenith Focus - Start coding...\n\nconsole.log(\"Hello from Zenith!\");");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("javascript");

  const languages = [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "cpp", label: "C++" },
    { id: "java", label: "Java" },
  ];

  // Theme-aware styles (Matching Dashboard)
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running Zenith Engine...");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setOutput(data.output || data.error || "No output returned.");
    } catch (err) {
      setOutput(`Error: ${err.message}\n(Make sure the backend is running and accessible)`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setOutput("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ 
      background: cardBg, 
      border: `1px solid ${cardBorder}`, 
      borderRadius: "24px", 
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Terminal size={20} color={fg} />
          </div>
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2, margin: 0 }}>Integrated IDE</h3>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Code Editor</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)",
              color: fg,
              border: `1px solid ${border}`,
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none"
            }}
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id} style={{ background: dark ? "#111" : "#fff", color: fg }}>
                {lang.label}
              </option>
            ))}
          </select>

          <button 
            onClick={handleCopy}
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              color: fg, 
              border: `1px solid ${border}`, 
              borderRadius: "10px", 
              padding: "8px 16px", 
              fontSize: "13px", 
              fontWeight: 600, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
          </button>
          <button 
            onClick={handleClear}
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              color: fg, 
              border: `1px solid ${border}`, 
              borderRadius: "10px", 
              padding: "8px 16px", 
              fontSize: "13px", 
              fontWeight: 600, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <RotateCcw size={14} /> Clear
          </button>
          <button 
            onClick={handleRun}
            disabled={loading}
            style={{ 
              background: fg, 
              color: dark ? "#000" : "#fff", 
              border: "none", 
              borderRadius: "10px", 
              padding: "8px 20px", 
              fontSize: "13px", 
              fontWeight: 700, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1
            }}
          >
            <Play size={14} fill="currentColor" /> {loading ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Editor Wrapper */}
      <div style={{ 
        height: "400px", 
        borderRadius: "16px", 
        overflow: "hidden", 
        border: `1px solid ${border}`,
        background: "#1e1e1e" // Standard Monaco dark
      }}>
        <Editor
          height="100%"
          language={language}
          theme={dark ? "vs-dark" : "light"}
          value={code}
          onChange={(val) => setCode(val)}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>

      {/* Console Output */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: fgMuted, letterSpacing: 1, textTransform: "uppercase" }}>Console Output</div>
        <div style={{ 
          background: dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)", 
          border: `1px solid ${border}`, 
          borderRadius: "12px", 
          padding: "16px",
          minHeight: "100px",
          maxHeight: "200px",
          overflowY: "auto",
          fontFamily: "'DM Mono', monospace",
          fontSize: "13px",
          color: dark ? "#4ade80" : "#166534",
          whiteSpace: "pre-wrap"
        }}>
          {output || "> Ready for execution."}
        </div>
      </div>
    </div>
  );
}
