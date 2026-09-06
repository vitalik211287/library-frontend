import {
  useRef,
  useState,
} from "react";

import {
  useZxing,
} from "react-zxing";

import "./BarcodeScanner.css";

import useScannerCameras from "./hooks/useScannerCameras.js";
import useBarcodeScan from "./hooks/useBarcodeScan.js";
import useBarcodeScannerEngine from "./hooks/useBarcodeScannerEngine.js";
import useScannerControls from "./hooks/useScannerControls.js";

const BarcodeScanner = ({
  onScan,
  onClose,
}) => {


  const [
    isScanned,
    setIsScanned,
  ] = useState(false);


  const scanLockRef =
    useRef(false);
  const {
    cameras,
    selectedCamera,
    cameraError,
    setCameraError,
    handleSwitchCamera,
  } = useScannerCameras({
    scanLockRef,
    setIsScanned,
  });
  const {
    handleScanResult,
  } = useBarcodeScan({
    onScan,
    selectedCamera,
    scanLockRef,
    setIsScanned,
  });


  /* =========================
     SCAN RESULT
  ========================= */


  const {
    ref,
    torch,
  } = useZxing({
    paused:
      !selectedCamera ||
      isScanned,

    deviceId:
      selectedCamera ||
      undefined,

    formats: [
      "ean_13",
    ],

    trySkew: true,

    timeBetweenDecodingAttempts:
      120,

    constraints: {
      audio: false,

      video:
        selectedCamera
          ? {
              deviceId: {
                exact:
                  selectedCamera,
              },

              width: {
                ideal:
                  1920,
              },

              height: {
                ideal:
                  1080,
              },
            }
          : {
              facingMode: {
                ideal:
                  "environment",
              },

              width: {
                ideal:
                  1920,
              },

              height: {
                ideal:
                  1080,
              },
            },
    },

    onDecodeResult: (
      result,
    ) => {
      handleScanResult(
        result.rawValue,
      );
    },

    onError: (
      error,
    ) => {
      console.error(
        "Помилка камери сканера:",
        error,
      );

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setCameraError(
          "Немає дозволу на використання камери",
        );

        return;
      }

      setCameraError(
        "Не вдалося запустити сканер",
      );
    },
  });

  /* =========================
     CLOSE
  ========================= */

  const handleClose =
    () => {
      scanLockRef.current =
        true;

      onClose();
    };

  /* =========================
     TORCH
  ========================= */

  const handleTorch =
    async () => {
      try {
        if (
          !torch
            ?.isAvailable
        ) {
          return;
        }

        if (
          torch.isOn
        ) {
          await torch.off();

          return;
        }

        await torch.on();
      } catch (error) {
        console.error(
          "Помилка ліхтарика:",
          error,
        );
      }
    };

  /* =========================
     JSX
  ========================= */

  return (
    <div
      className="scanner-overlay"
      onClick={
        handleClose
      }
    >
      <div
        className="scanner-modal"
        onClick={(
          event,
        ) => {
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className="scanner-close"
          onClick={
            handleClose
          }
          aria-label="Закрити сканер"
        >
          ×
        </button>

        <h2>
          Сканувати ISBN
        </h2>

        <p>
          {isScanned
            ? "ISBN розпізнано. Шукаємо книгу..."
            : "Наведіть камеру на штрихкод книги"}
        </p>

        {cameraError ? (
          <div className="scanner-error">
            {
              cameraError
            }
          </div>
        ) : (
          <div className="scanner-camera">
            <video
              ref={ref}
              className="scanner-video"
              muted
              playsInline
              autoPlay
            />

            <div
              className={
                isScanned
                  ? "scanner-frame scanner-frame--success"
                  : "scanner-frame"
              }
            />

            {!isScanned &&
              cameras.length >
                1 && (
                <button
                  type="button"
                  className="scanner-switch-camera"
                  onClick={
                    handleSwitchCamera
                  }
                  aria-label="Змінити камеру"
                  title="Змінити камеру"
                >
                  ↻
                </button>
              )}

            {!isScanned &&
              torch
                ?.isAvailable && (
                <button
                  type="button"
                  className="scanner-torch"
                  onClick={
                    handleTorch
                  }
                  aria-label={
                    torch.isOn
                      ? "Вимкнути ліхтарик"
                      : "Увімкнути ліхтарик"
                  }
                  title={
                    torch.isOn
                      ? "Вимкнути ліхтарик"
                      : "Увімкнути ліхтарик"
                  }
                >
                  {torch.isOn
                    ? "☀"
                    : "⚡"}
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
