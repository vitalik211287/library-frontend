import { useEffect, useRef } from "react";
import { decodeEan13FromVideo } from "../utils/decodeEan13FromVideo.js";
import {
  captureBarcodeRegion,
  decodeEan13FromPixels,
  normalizeIsbn,
} from "../utils/decodeEan13FromFrame.js";

const FALLBACK_START_DELAY_MS = 1200;
const FALLBACK_INTERVAL_MS = 900;
const isExpectedDecodeError = (error) =>
  /NotFound|Checksum|FormatException/.test(error?.name ?? "");

const useEan13Fallback = ({ videoRef, enabled, scanLockRef, onScan }) => {
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let intervalId = null;
    let busy = false;
    let warned = false;

    const reportError = (error) => {
      if (isExpectedDecodeError(error) || warned || cancelled) return;
      warned = true;
      console.warn("EAN-13 fallback decoder error", error);
    };

    const start = async () => {
      try {
        // No additional package or camera stream: both paths read the video
        // element managed by react-zxing.
        const zxing = await import("@zxing/library");
        if (cancelled) return;

        const hints = new Map([
          [zxing.DecodeHintType.POSSIBLE_FORMATS, [zxing.BarcodeFormat.EAN_13]],
          [zxing.DecodeHintType.TRY_HARDER, true],
        ]);
        const browserReader = new zxing.BrowserMultiFormatReader(hints);
        const pixelReader = new zxing.MultiFormatReader();
        pixelReader.setHints(hints);
        const canvas = document.createElement("canvas");

        // BarcodeDetector is optional (and unsupported in some browsers).
        let nativeReader = null;
        if (typeof window.BarcodeDetector === "function") {
          try {
            nativeReader = new window.BarcodeDetector({ formats: ["ean_13"] });
          } catch {
            // Keep the JS fallback available when the format is unsupported.
          }
        }

        const scan = async () => {
          if (cancelled || busy || scanLockRef.current || document.hidden) return;
          const video = videoRef.current;
          if (!video || video.readyState < 2 || !video.videoWidth) return;

          busy = true;
          try {
            // Preserve the original full-frame fallback first.
            try {
              if (decodeEan13FromVideo({
                reader: browserReader,
                video,
                onScan: (isbn) => onScanRef.current(isbn),
              })) return;
            } catch (error) {
              reportError(error);
            }

            // A crop around the on-screen scan frame improves the barcode's
            // share of pixels and avoids background text/other barcodes.
            const frame = captureBarcodeRegion({ video, canvas });
            if (!frame || cancelled || scanLockRef.current) return;

            if (nativeReader) {
              try {
                const codes = await nativeReader.detect(canvas);
                if (cancelled || scanLockRef.current) return;
                for (const code of codes) {
                  const isbn = normalizeIsbn(code.rawValue);
                  if (isbn) {
                    onScanRef.current(isbn);
                    return;
                  }
                }
              } catch (error) {
                // Unsupported native APIs must not disable JS decoding.
                reportError(error);
                nativeReader = null;
              }
            }

            const rgba = frame.context.getImageData(
              0, 0, frame.width, frame.height,
            ).data;
            const isbn = decodeEan13FromPixels({
              rgba,
              width: frame.width,
              height: frame.height,
              zxing,
              reader: pixelReader,
            });
            if (isbn && !cancelled && !scanLockRef.current) {
              onScanRef.current(isbn);
            }
          } catch (error) {
            reportError(error);
          } finally {
            busy = false;
          }
        };

        intervalId = window.setInterval(() => {
          void scan();
        }, FALLBACK_INTERVAL_MS);
        void scan();
      } catch (error) {
        if (!cancelled) console.warn("EAN-13 fallback unavailable", error);
      }
    };

    const startTimer = window.setTimeout(() => {
      void start();
    }, FALLBACK_START_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [enabled, scanLockRef, videoRef]);
};

export default useEan13Fallback;
