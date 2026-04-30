import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div style={styles.nav}>
      <h3 style={styles.logo}>Zenith</h3>

      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>
          Dashboard
        </Link>
        <Link to="/face" style={styles.link}>
          Face
        </Link>
        <Link to="/tracker" style={styles.link}>
          Tracker
        </Link>
        <Link to="/ai" style={styles.link}>
          AI
        </Link>
        <Link to="/tools" style={styles.link}>
          Tools
        </Link>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    borderBottom: "1px solid white",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
};
