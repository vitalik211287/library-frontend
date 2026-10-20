import { useEffect, useRef } from "react";
import { decodeEan13FromVideo } from "../utils/decodeEan13FromVideo.js";

// Keep the existing WASM scanner as the primary path. Try the independently
// implemented JS ZXing decoder only when the camera has been scanning for a while.
const FALLBACK_START_DELAY_MS = 1200;
const FALLBACK_INTERVAL_MS = 900;

const useEan13Fallback = ({ videoRef, enabled, scanLockRef, onScan }) => {
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let intervalId = null;
    let warned = false;

    const start = async () => {
      try {
        // Loaded only while scanning. The existing @zxing/library dependency
        // does not require a second camera stream or another package.
        const {
          BarcodeFormat,
          BrowserMultiFormatReader,
          DecodeHintType,
        } = await import("@zxing/library");
        if (cancelled) return;

        const hints = new Map([
          [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
          [DecodeHintType.TRY_HARDER, true],
        ]);
        const reader = new BrowserMultiFormatReader(hints);

        const scan = () => {
          if (cancelled || scanLockRef.current || document.hidden) return;

          try {
            decodeEan13FromVideo({
              reader,
              video: videoRef.current,
              onScan: (isbn) => onScanRef.current(isbn),
            });
          } catch (error) {
            // ZXing reports empty frames as decode exceptions; those are
            // normal and should not be shown to the user on every frame.
            if (/NotFound|Checksum|FormatException/.test(error?.name ?? "")) return;
            if (!warned) {
              warned = true;
              console.warn("EAN-13 fallback decoder error", error);
            }
          }
        };

        intervalId = window.setInterval(scan, FALLBACK_INTERVAL_MS);
        scan();
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
