import { useEffect, useMemo, useState } from "react";
import { useZxing } from "react-zxing";
import "./BarcodeScanner.css";

function BarcodeScanner({ onScan, onClose }) {
  const [backCameras, setBackCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  useEffect(() => {
    const getCameras = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        const rearCameras = videoDevices.filter((camera) => {
          const label = camera.label.toLowerCase();

          return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment")
          );
        });

        const availableBackCameras =
          rearCameras.length > 0 ? rearCameras : videoDevices;

        setBackCameras(availableBackCameras);

        const savedCameraId = localStorage.getItem(
          "library-scanner-camera",
        );

        const savedCamera = availableBackCameras.find(
          (camera) => camera.deviceId === savedCameraId,
        );

        if (savedCamera) {
          setSelectedCamera(savedCamera.deviceId);
          return;
        }

        const preferredCamera =
          availableBackCameras.find((camera) =>
            camera.label.toLowerCase().includes("camera 0"),
          ) || availableBackCameras[0];

        if (preferredCamera) {
          setSelectedCamera(preferredCamera.deviceId);
        }
      } catch (error) {
        console.error("Помилка отримання камер:", error);
      }
    };

    getCameras();
  }, []);

  const currentCameraIndex = useMemo(() => {
    return backCameras.findIndex(
      (camera) => camera.deviceId === selectedCamera,
    );
  }, [backCameras, selectedCamera]);

  const handleSwitchCamera = () => {
    if (backCameras.length < 2) {
      return;
    }

    const nextIndex =
      currentCameraIndex === -1
        ? 0
        : (currentCameraIndex + 1) % backCameras.length;

    const nextCamera = backCameras[nextIndex];

    setSelectedCamera(nextCamera.deviceId);

    localStorage.setItem(
      "library-scanner-camera",
      nextCamera.deviceId,
    );
  };

  const { ref } = useZxing({
    paused: !selectedCamera,

    deviceId: selectedCamera,

    formats: ["ean_13"],

    trySkew: true,

    timeBetweenDecodingAttempts: 150,

    onDecodeResult(result) {
      const isbn = result.rawValue;

      if (isbn?.length === 13) {
        localStorage.setItem(
          "library-scanner-camera",
          selectedCamera,
        );

        onScan(isbn);
      }
    },

    onError(error) {
      console.error("Помилка сканера:", error);
    },
  });

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div
        className="scanner-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="scanner-close"
          onClick={onClose}
          aria-label="Закрити сканер"
        >
          ×
        </button>

        <h2>Сканувати ISBN</h2>

        <p>Наведіть камеру на штрихкод книги</p>

        <div className="scanner-camera">
          <video
            ref={ref}
            className="scanner-video"
            muted
            playsInline
          />

          <div className="scanner-frame" />

          {backCameras.length > 1 && (
            <button
              type="button"
              className="scanner-switch-camera"
              onClick={handleSwitchCamera}
              aria-label="Змінити камеру"
              title="Змінити камеру"
            >
              ↻
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;