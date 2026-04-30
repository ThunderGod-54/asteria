import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../Theme";
import {
  Sun, Moon, LayoutDashboard, ScanFace, ActivitySquare,
  Bot, Wrench, Menu, ChevronLeft, ArrowLeft, LogOut, Settings, LogIn
} from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import logoBlack from "../assets/logo_white.png";
import logoWhite from "../assets/logo_black.png";
import doodleDark from "../assets/sdw.png";
import doodleLight from "../assets/sdb.png";

export default function Sidebar() {
  const { dark, setDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };
  const location = useLocation();

  const bg = dark ? "rgba(8,8,8,0.85)" : "rgba(245,245,240,0.85)";
  const fg = dark ? "#FFFFFF" : "#0A0A0A";
  const fgMuted = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const activeBg = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
      
      .sidebar-link-hover:hover {
        background: ${activeBg} !important;
        color: ${fg} !important;
        transform: translateX(4px);
      }
      .sidebar-link-hover.collapsed:hover {
        transform: scale(1.1);
      }
      .sidebar-transition {
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [activeBg, fg]);

  const links = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/face", icon: <ScanFace size={20} />, label: "Face Tracking" },
    { to: "/tracker", icon: <ActivitySquare size={20} />, label: "App Tracker" },
    { to: "/ai", icon: <Bot size={20} />, label: "AI Insights" },
    { to: "/tools", icon: <Wrench size={20} />, label: "Tools" },
  ];

  return (
    <div className="sidebar-transition no-scrollbar" style={{
      width: collapsed ? "80px" : "260px",
      height: "100vh",
      overflowY: "auto",
      background: bg,
      backdropFilter: "blur(20px)",
      borderRight: `1px solid ${border}`,
      display: "flex",
      flexDirection: "column",
      padding: "24px 16px",
      position: "relative",
      zIndex: 1001,
      color: fg,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* ── HEADER ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        marginBottom: 48,
        paddingLeft: collapsed ? 0 : 8
      }}>
        {!collapsed && (
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <img src={dark ? logoWhite : logoBlack} alt="Logo" style={{ height: 32, width: "auto" }} />
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2 }}>
              ZENITH
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: `1px solid ${border}`,
            color: fg,
            borderRadius: 8,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
          }}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* ── LINKS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link-hover sidebar-transition ${collapsed ? "collapsed" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 14px",
                borderRadius: 12,
                textDecoration: "none",
                color: isActive ? fg : fgMuted,
                background: isActive ? activeBg : "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: 15,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={collapsed ? link.label : ""}
            >
              <span style={{ display: "flex", alignItems: "center", color: isActive ? fg : fgMuted }}>
                {link.icon}
              </span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {/* ── DOODLE ART ── */}
        {!collapsed && (
          <div style={{ marginTop: 'auto', padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
            <img
              src={dark ? doodleDark : doodleLight}
              alt="Doodle Art"
              style={{
                width: '110px',
                height: 'auto',
                borderRadius: 12,
                opacity: 0.6,
                filter: dark ? 'brightness(0.8)' : 'none',
                transition: 'opacity 0.3s'
              }}
            />
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingTop: 24,
        borderTop: `1px solid ${border}`
      }}>
        <button
          onClick={() => setDark(!dark)}
          className="sidebar-link-hover sidebar-transition"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "transparent",
            border: "none",
            color: fgMuted,
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 500,
            justifyContent: collapsed ? "center" : "flex-start",
            width: "100%"
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </span>
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>


        {user ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 12,
            background: activeBg,
            marginTop: 8,
            justifyContent: collapsed ? "center" : "flex-start"
          }}>
            <img
              src={user.photoURL}
              alt="Avatar"
              style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${border}` }}
            />
            {!collapsed && (
              <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center", minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.displayName.split(' ')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  style={{ background: "transparent", border: "none", color: fgMuted, cursor: "pointer", padding: 4 }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="sidebar-link-hover sidebar-transition"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "transparent",
              border: `1px solid ${border}`,
              color: fg,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              justifyContent: collapsed ? "center" : "center",
              marginTop: 8,
              width: "100%"
            }}
          >
            <LogIn size={18} />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </div>
  );
}

