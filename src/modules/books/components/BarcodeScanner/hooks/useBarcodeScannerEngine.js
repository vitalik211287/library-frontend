import {
  useZxing,
} from "react-zxing";

const useBarcodeScannerEngine = ({
  selectedCamera,
  isScanned,
  handleScanResult,
  setCameraError,
}) => {
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
                ideal: 1920,
              },

              height: {
                ideal: 1080,
              },
            }
          : {
              facingMode: {
                ideal:
                  "environment",
              },

              width: {
                ideal: 1920,
              },

              height: {
                ideal: 1080,
              },
            },
    },

    onDecodeResult: (result) => {
      handleScanResult(
        result.rawValue,
      );
    },

    onError: (error) => {
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

  return {
    ref,
    torch,
  };
};

export default useBarcodeScannerEngine;
