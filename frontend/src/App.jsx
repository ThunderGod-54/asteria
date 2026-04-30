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
import Navbar from "./components/Navbar";

function Layout() {
  const location = useLocation();

  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing WITHOUT layout */}
        <Route path="/" element={<Landing />} />

        {/* All other pages WITH layout */}
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
