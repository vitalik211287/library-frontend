import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import "./BarcodeScanner.css";

function BarcodeScanner({ onScan, onClose }) {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  useEffect(() => {
    const getCameras = async () => {
      try {
        // Спочатку просимо доступ до камери,
        // щоб браузер показав назви пристроїв
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        setCameras(videoDevices);

        // За замовчуванням беремо останню задню камеру
        if (videoDevices.length > 0) {
          const backCamera =
            videoDevices.find((camera) =>
              camera.label.toLowerCase().includes("back"),
            ) || videoDevices[videoDevices.length - 1];

          setSelectedCamera(backCamera.deviceId);
        }
      } catch (error) {
        console.error("Помилка отримання камер:", error);
      }
    };

    getCameras();
  }, []);

  const hints = new Map();

  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

  hints.set(DecodeHintType.TRY_HARDER, true);

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

    hints,

    onDecodeResult(result) {
      const isbn = result.getText();

      console.log("Знайдено штрихкод:", isbn);

      // ISBN-13 повинен містити 13 цифр
      if (/^\d{13}$/.test(isbn)) {
        onScan(isbn);
      }
    },

    onDecodeError(error) {
      // NotFoundException виникає постійно,
      // поки штрихкод ще не знайдено.
      // Тому її в консоль не виводимо.
      if (error?.name !== "NotFoundException") {
        console.error("Помилка сканування:", error);
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
          <video ref={ref} className="scanner-video" muted playsInline />

          <div className="scanner-frame" />
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
