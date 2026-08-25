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
        facingMode: "environment",
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
        >
          ×
        </button>

        <h2>Сканувати ISBN</h2>

        <p>Наведіть камеру на штрихкод книги</p>

        <video ref={ref} className="scanner-video" />
      </div>
    </div>
  );
}

export default BarcodeScanner;