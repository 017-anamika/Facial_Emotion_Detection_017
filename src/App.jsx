import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("");
  const [intensity, setIntensity] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const emojiMap = {
    happy: "😄",
    sad: "😢",
    angry: "😠",
    surprised: "😲",
    disgusted: "🤢",
    fearful: "😨",
    neutral: "😐",
  };

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(
      `${MODEL_URL}/tiny_face_detector_model`
    );
    await faceapi.nets.faceExpressionNet.loadFromUri(
      `${MODEL_URL}/face_expression_model`
    );
    setLoading(false);
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setVideoPlaying(true);
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const stopVideo = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setVideoPlaying(false);
    setEmotion("");
    setAlertMessage("");
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
        setIntensity(maxValue);
        if (dominantEmotion === "happy" && maxValue > 0.8) {
          setAlertMessage("😊 You're looking happy!");
        } else if (dominantEmotion === "sad" && maxValue > 0.8) {
          setAlertMessage("😢 You seem a bit down...");
        } else {
          setAlertMessage("");
        }
      }
    }, 200);

    return () => clearInterval(interval);
  };

  const captureScreenshot = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL("image/png");
    setScreenshot(imageUrl);
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Facial Emotion Detection</h1>

      {loading ? (
        <div style={styles.loading}>Loading AI Models... ⏳</div>
      ) : (
        <>
          <div style={styles.videoContainer}>
            <video
              ref={videoRef}
              autoPlay
              muted
              onPlay={handleVideoOnPlay}
              style={styles.video}
            />
            <canvas ref={canvasRef} style={styles.canvas} />
          </div>

          <div style={styles.emotionBox}>
            <h2>Detected Emotion:</h2>
            <div style={styles.emotionText}>
              {emotion ? (
                <>
                  {emojiMap[emotion] || "🤔"} {emotion.toUpperCase()}
                </>
              ) : (
                "Detecting..."
              )}
            </div>

            {/* Intensity Bar */}
            <div style={styles.intensityBar}>
              <div
                style={{
                  ...styles.intensityMeter,
                  width: `${intensity * 100}%`,
                  backgroundColor: intensity > 0.5 ? "#4CAF50" : "#FF5722",
                }}
              ></div>
            </div>
          </div>

          {/* Alert Message */}
          {alertMessage && <div style={styles.alertBox}>{alertMessage}</div>}

          <div style={styles.buttonContainer}>
            {!videoPlaying ? (
              <button onClick={startVideo} style={styles.button}>
                Start Video
              </button>
            ) : (
              <button onClick={stopVideo} style={styles.button}>
                Stop Video
              </button>
            )}
            <button onClick={captureScreenshot} style={styles.button}>
              Capture Screenshot
            </button>
          </div>

          {/* Display Screenshot */}
          {screenshot && (
            <div style={styles.screenshotContainer}>
              <h3>Captured Screenshot</h3>
              <img
                src={screenshot}
                alt="Captured Screenshot"
                style={styles.screenshot}
              />
            </div>
          )}
        </>
      )}
      {/* <footer style={styles.footer}>
        Made with ❤️ by Anamika
      </footer> */}
    </div>
  );
}
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 20px",
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "20px",
  },
  loading: {
    fontSize: "1.5rem",
    color: "#555",
    marginTop: "40px",
  },
  videoContainer: {
    position: "relative",
    width: "720px",
    height: "560px",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
  },
  emotionBox: {
    marginTop: "30px",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: "20px",
    borderRadius: "16px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  emotionText: {
    fontSize: "2rem",
    marginTop: "10px",
    fontWeight: "600",
    color: "#222",
  },
  intensityBar: {
    marginTop: "10px",
    height: "12px",
    borderRadius: "6px",
    width: "100%",
    backgroundColor: "#ddd",
    overflow: "hidden",
  },
  intensityMeter: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  alertBox: {
    marginTop: "20px",
    fontSize: "1.2rem",
    color: "#d9534f",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: "25px",
    display: "flex",
    gap: "20px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "12px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  screenshotContainer: {
    marginTop: "20px",
    textAlign: "center",
  },
  screenshot: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "8px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
  },
  footer: {
    marginTop: "50px",
    color: "#333",
    fontSize: "1rem",
    fontWeight: "500",
  },
};

export default App;
