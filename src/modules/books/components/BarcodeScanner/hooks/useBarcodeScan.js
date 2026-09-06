import { useCallback } from "react";

import {
  isValidIsbn13,
} from "../utils/scannerHelpers.js";

const CAMERA_STORAGE_KEY = "library-scanner-camera";

const useBarcodeScan = ({
  onScan,
  selectedCamera,
  scanLockRef,
  setIsScanned,
}) => {
  const handleScanResult = useCallback(
    (value) => {
      if (scanLockRef.current) {
        return;
      }

      const cleanIsbn = String(
        value ?? "",
      ).replace(/\D/g, "");

      if (!isValidIsbn13(cleanIsbn)) {
        return;
      }

      scanLockRef.current = true;
      setIsScanned(true);

      if (selectedCamera) {
        localStorage.setItem(
          CAMERA_STORAGE_KEY,
          selectedCamera,
        );
      }

      onScan(cleanIsbn);
    },
    [
      onScan,
      selectedCamera,
      scanLockRef,
      setIsScanned,
    ],
  );

  return {
    handleScanResult,
  };
};

export default useBarcodeScan;
