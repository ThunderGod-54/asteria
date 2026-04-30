import { useEffect } from "react";

export default function FaceDetection() {
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = document.getElementById("video");
      video.srcObject = stream;
    });
  }, []);

  return (
    <div className="container">
      <h2>Face Detection</h2>

      <video id="video" autoPlay width="400" />

      <div className="card">
        <p>Status: Tracking...</p>
      </div>
    </div>
  );
}
