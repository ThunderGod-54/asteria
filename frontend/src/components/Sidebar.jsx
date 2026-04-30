import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../Theme";
import { Sun, Moon, LayoutDashboard, ScanFace, ActivitySquare, Bot, Wrench, Menu, ChevronLeft } from "lucide-react";

export default function Sidebar() {
  const { dark, setDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="sidebar" style={{ ...styles.sidebar, width: collapsed ? "80px" : "250px" }}>
      <div style={styles.top}>
        <div style={{ ...styles.header, flexDirection: collapsed ? "column" : "row" }}>
          {!collapsed && <h2 style={styles.logo}>Zenith</h2>}
          
          <div style={{ display: "flex", gap: "10px", flexDirection: collapsed ? "column" : "row" }}>
            <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle Theme">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
              {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        <div style={styles.links}>
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={collapsed} />
          <SidebarLink to="/face" icon={<ScanFace size={20} />} label="Face" collapsed={collapsed} />
          <SidebarLink to="/tracker" icon={<ActivitySquare size={20} />} label="Tracker" collapsed={collapsed} />
          <SidebarLink to="/ai" icon={<Bot size={20} />} label="AI" collapsed={collapsed} />
          <SidebarLink to="/tools" icon={<Wrench size={20} />} label="Tools" collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, collapsed }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className="sidebar-link"
      style={{ 
        color: isActive ? "var(--link-hover)" : "var(--link-color)",
        justifyContent: collapsed ? "center" : "flex-start",
        backgroundColor: isActive ? "var(--card-border)" : "transparent"
      }}
      title={collapsed ? label : ""}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

const styles = {
  sidebar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "30px 15px",
    backgroundColor: "var(--sidebar-bg)",
    borderRight: "1px solid var(--sidebar-border)",
    transition: "width 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "40px",
    gap: "15px",
  },
  logo: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--text-color)",
    whiteSpace: "nowrap"
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  }
};
