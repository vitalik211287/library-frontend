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
          video: {
            facingMode: "environment",
          },
        });

        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        setCameras(videoDevices);

        if (videoDevices.length > 0) {
          const backCameras = videoDevices.filter((camera) =>
            camera.label.toLowerCase().includes("back"),
          );

          const defaultCamera =
            backCameras[0] || videoDevices[videoDevices.length - 1];

          setSelectedCamera(defaultCamera.deviceId);
        }
      } catch (error) {
        console.error("Помилка отримання камер:", error);
      }
    };

    getCameras();
  }, []);

  const { ref } = useZxing({
    deviceId: selectedCamera || undefined,

    formats: ["ean_13"],

    tryHarder: true,
    trySkew: true,

    onDecodeResult(result) {
      console.log("Результат сканування:", result);

      const isbn = result.rawValue;

      if (!isbn) {
        return;
      }

      console.log("Знайдений ISBN:", isbn);

      if (/^97[89]\d{10}$/.test(isbn)) {
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

        {cameras.length > 1 && (
          <select
            className="scanner-camera-select"
            value={selectedCamera}
            onChange={(event) => setSelectedCamera(event.target.value)}
          >
            {cameras.map((camera, index) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Камера ${index + 1}`}
              </option>
            ))}
          </select>
        )}

        <div className="scanner-camera">
          <video
            ref={ref}
            className="scanner-video"
            muted
            playsInline
          />

          <div className="scanner-frame" />
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;