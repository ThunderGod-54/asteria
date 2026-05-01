import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import FaceDetection from "./pages/FaceDetection";
import AppTracker from "./pages/AppTracker";
import Ai from "./pages/Ai";
import Tools from "./pages/Tools";
import Sidebar from "./components/Sidebar";
import { FaceDetector } from "face-detection-module";
import { useSession } from "./services/sessionContext";
import { Toaster } from "react-hot-toast";

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";
  const { isDetecting, handleFaceDetected, handleNoFace, liveStats } = useSession();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!hideNavbar && <Sidebar />}

      {/* Persistent floating camera PiP — stays alive across all routes */}
      {isDetecting && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          width: 200, aspectRatio: '4/3'
        }}>
          <FaceDetector
            width={320} height={240}
            noFaceGrace={1000} alertOnNoFace={true}
            onFaceDetected={handleFaceDetected}
            onNoFace={handleNoFace}
          />
          {liveStats && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.7)', padding: '4px 8px',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'monospace'
            }}>
              <span style={{ color: '#4ade80' }}>● REC</span>
              <span>{liveStats.duration}</span>
              <span>{liveStats.attentionPct}%</span>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

// Handles /join/:roomId and /playground/:roomId share links from Sketchly
function ToolsWithRoom() {
  const { roomId } = useParams();
  return <Tools initialRoomId={roomId} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        containerStyle={{ zIndex: 99999 }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/face" element={<FaceDetection />} />
          <Route path="/tracker" element={<AppTracker />} />
          <Route path="/ai" element={<Ai />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/join/:roomId" element={<ToolsWithRoom />} />
          <Route path="/playground/:roomId" element={<ToolsWithRoom />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
