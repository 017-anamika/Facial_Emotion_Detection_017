import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("");

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(
      `${MODEL_URL}/tiny_face_detector_model`
    );
    await faceapi.nets.faceExpressionNet.loadFromUri(
      `${MODEL_URL}/face_expression_model`
    );
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections) {
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        const expressions = resizedDetections.expressions;
        const maxValue = Math.max(...Object.values(expressions));
        const dominantEmotion = Object.keys(expressions).find(
          (key) => expressions[key] === maxValue
        );
        setEmotion(dominantEmotion);
      }
    }, 200);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    loadModels().then(startVideo);
  }, []);

  return (
    <div style={{  backgroundColor:"red",textAlign: "center", marginTop: "20px" }}>
      <h1>Facial Emotion Detection</h1>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: "720px",
          height: "560px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoOnPlay}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      <h2 style={{ marginTop: "20px" }}>Detected Emotion: {emotion}</h2>
    </div>
  );
}

export default App;
