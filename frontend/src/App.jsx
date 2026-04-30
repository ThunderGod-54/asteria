import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import FaceDetection from "./pages/FaceDetection";
import AppTracker from "./pages/AppTracker";
import Ai from "./pages/Ai";
import Tools from "./pages/Tools";
import Sidebar from "./components/Sidebar";

function Layout() {
  const location = useLocation();

  const hideNavbar = location.pathname === "/";

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!hideNavbar && <Sidebar />}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/face" element={<FaceDetection />} />
          <Route path="/tracker" element={<AppTracker />} />
          <Route path="/ai" element={<Ai />} />
          <Route path="/tools" element={<Tools />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
