import { useZxing } from "react-zxing";
import "./BarcodeScanner.css";

function BarcodeScanner({ onScan, onClose }) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedValue = result.getText();

      if (scannedValue) {
        onScan(scannedValue);
      }
    },

    constraints: {
      video: {
        facingMode: {
          ideal: "environment",
        },
        width: {
          ideal: 1920,
        },
        height: {
          ideal: 1080,
        },
      },
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
            autoPlay
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