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
          audio: false,
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
    paused: !selectedCamera,

    deviceId: selectedCamera,

    formats: ["ean_13"],

    trySkew: true,

    timeBetweenDecodingAttempts: 150,

    onDecodeResult(result) {
      console.log("Знайдено штрихкод:", result);

      const isbn = result.rawValue;

      if (isbn?.length === 13) {
        onScan(isbn);
      }
    },

    onDecodeError(error) {
      console.error("Помилка декодування:", error);
    },

    onError(error) {
      console.error("Помилка камери / ZXing:", error);
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
            onChange={(event) =>
              setSelectedCamera(event.target.value)
            }
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