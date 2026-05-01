import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2, LayoutGrid, Clock } from "lucide-react";
import { useTheme } from "../Theme";

export default function StudyPlanner() {
  const { dark } = useTheme();
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("zenith_study_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Complete Advanced Calculus Assignment", completed: false, category: "Math" },
      { id: 2, text: "Review React Design Patterns", completed: true, category: "CS" },
    ];
  });
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("zenith_study_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false, category: "General" }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const cardBg = dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: fgMuted, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            <LayoutGrid size={12} /> SESSION FOCUS
          </div>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Study Planner</h3>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", padding: "8px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color={fgMuted} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{tasks.filter(t => t.completed).length}/{tasks.length} Done</span>
        </div>
      </div>

      <form onSubmit={addTask} style={{ position: "relative" }}>
        <input 
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What's your focus today?"
          style={{
            width: "100%",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: "14px 48px 14px 20px",
            color: fg,
            fontSize: 14,
            outline: "none",
            transition: "all 0.3s",
            fontFamily: "inherit"
          }}
        />
        <button type="submit" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: fg, color: dark ? "#000" : "#fff", border: "none", width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Plus size={18} />
        </button>
      </form>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingRight: 4 }}>
        {tasks.map(task => (
          <div 
            key={task.id} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              padding: "12px 16px", 
              background: task.completed ? "transparent" : cardBg,
              border: `1px solid ${task.completed ? "transparent" : border}`,
              borderRadius: 16,
              transition: "all 0.3s",
              opacity: task.completed ? 0.6 : 1
            }}
          >
            <button 
              onClick={() => toggleTask(task.id)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: task.completed ? "#10b981" : fgMuted }}
            >
              {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: task.completed ? "line-through" : "none" }}>
              {task.text}
            </span>
            <button 
              onClick={() => deleteTask(task.id)}
              style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "rgba(239, 68, 68, 0.4)", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(239, 68, 68, 0.4)"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
