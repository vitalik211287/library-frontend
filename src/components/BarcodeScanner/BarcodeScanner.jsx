import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";
import "./BarcodeScanner.css";

function BarcodeScanner({ onScan, onClose }) {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  useEffect(() => {
    const getCameras = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        setCameras(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Помилка отримання камер:", error);
      }
    };

    getCameras();
  }, []);

  const { ref } = useZxing({
    constraints: {
      video: selectedCamera
        ? {
            deviceId: {
              exact: selectedCamera,
            },
          }
        : {
            facingMode: "environment",
          },
    },

    onDecodeResult(result) {
      const scannedValue = result.getText();

      if (scannedValue) {
        onScan(scannedValue);
      }
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
        >
          ×
        </button>

        <h2>Сканувати ISBN</h2>

        <p>Наведіть камеру на штрихкод книги</p>

        {cameras.length > 1 && (
          <select
            className="scanner-camera-select"
            value={selectedCamera}
            onChange={(event) => setSelectedCamera(event.target.value)}
          >
            {cameras.map((camera, index) => (
              <option
                key={camera.deviceId}
                value={camera.deviceId}
              >
                {camera.label || `Камера ${index + 1}`}
              </option>
            ))}
          </select>
        )}

        <video
          ref={ref}
          className="scanner-video"
          muted
          playsInline
        />
      </div>
    </div>
  );
}

export default BarcodeScanner;