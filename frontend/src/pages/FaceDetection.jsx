import React, { useState, useCallback } from 'react';
import { FaceDetector } from 'face-detection-module';

export default function FaceDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Idle');
  
  const addLog = useCallback((message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 8));
  }, []);

  const handleFaceDetected = useCallback((detections) => {
    setStatus('Face Detected');
    addLog(`Face found: ${detections.length}`, 'success');
  }, [addLog]);

  const handleNoFace = useCallback(() => {
    setStatus('No Face Detected!');
    addLog('Alert: No face detected!', 'error');
  }, [addLog]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Face Detection System</h1>
        <p style={styles.description}>
          Click "Start Detection" to begin monitoring. Ensure your camera is enabled.
          If no face is detected for 3 seconds, an audio alert will trigger.
        </p>
      </div>

      <div style={styles.controls}>
        <button 
          style={isDetecting ? styles.stopButton : styles.startButton}
          onClick={() => {
            if (isDetecting) {
              setStatus('Idle');
              addLog('Detection stopped', 'info');
            } else {
              setStatus('Initializing...');
              addLog('Detection started', 'info');
            }
            setIsDetecting(!isDetecting);
          }}
        >
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.videoSection}>
          {isDetecting ? (
            <div style={styles.detectorWrapper}>
              <FaceDetector
                width={640}
                height={480}
                noFaceGrace={3000}
                alertOnNoFace={true}
                onFaceDetected={handleFaceDetected}
                onNoFace={handleNoFace}
              />
            </div>
          ) : (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>📷</div>
              <p>Camera offline</p>
            </div>
          )}
        </div>

        <div style={styles.infoSection}>
          <div style={styles.statusCard}>
            <h3 style={styles.cardTitle}>System Status</h3>
            <div style={{
              ...styles.statusBadge,
              backgroundColor: status === 'Idle' ? '#444' : status === 'Initializing...' ? '#f59f00' : status === 'Face Detected' ? '#2b8a3e' : '#e03131'
            }}>
              {status}
            </div>
          </div>

          <div style={styles.logsCard}>
            <h3 style={styles.cardTitle}>Recent Activity</h3>
            {logs.length === 0 ? (
              <p style={{ color: '#888', margin: 0 }}>No activity yet.</p>
            ) : (
              <ul style={styles.logList}>
                {logs.map((log, i) => (
                  <li key={i} style={styles.logItem}>
                    <span style={styles.logTime}>[{log.time}]</span>
                    <span style={{ 
                      color: log.type === 'error' ? '#ff8787' : log.type === 'success' ? '#8ce99a' : '#e9ecef'
                    }}>
                      {log.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    color: '#e9ecef',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '1px solid #333',
    paddingBottom: '1.5rem',
  },
  title: {
    fontSize: '2.5rem',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800',
  },
  description: {
    color: '#adb5bd',
    margin: '0',
    fontSize: '1.1rem',
    lineHeight: '1.5',
  },
  controls: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#1c7ed6',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    fontSize: '1.2rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(28, 126, 214, 0.4)',
    transition: 'all 0.2s ease',
  },
  stopButton: {
    backgroundColor: '#fa5252',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    fontSize: '1.2rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(250, 82, 82, 0.4)',
    transition: 'all 0.2s ease',
  },
  content: {
    display: 'flex',
    gap: '2.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  videoSection: {
    flex: '1 1 auto',
    maxWidth: '640px',
    display: 'flex',
    justifyContent: 'center',
  },
  detectorWrapper: {
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    border: '2px solid #2b2b2b',
    backgroundColor: '#000',
    position: 'relative',
  },
  placeholder: {
    width: '100%',
    maxWidth: '640px',
    aspectRatio: '4/3',
    backgroundColor: '#111',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    border: '2px dashed #333',
    fontSize: '1.2rem',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
  },
  placeholderIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: '0.5',
  },
  infoSection: {
    flex: '1 1 350px',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statusCard: {
    backgroundColor: '#1a1b1e',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid #2c2e33',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.2rem',
    color: '#f8f9fa',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    borderRadius: '30px',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#fff',
    transition: 'background-color 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  logsCard: {
    backgroundColor: '#1a1b1e',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid #2c2e33',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    flex: 1,
    minHeight: '250px',
  },
  logList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  logItem: {
    fontSize: '0.95rem',
    padding: '10px 12px',
    backgroundColor: '#25262b',
    borderRadius: '8px',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    borderLeft: '3px solid #444',
  },
  logTime: {
    color: '#868e96',
    fontFamily: '"Fira Code", monospace',
    fontSize: '0.85rem',
  }
};
