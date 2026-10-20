import { isValidIsbn13 } from "./scannerHelpers.js";

/**
 * Decode a frame from the video stream already opened by react-zxing.
 * Never opens its own MediaStream; both decoders share the same video element.
 */
export const decodeEan13FromVideo = ({ reader, video, onScan }) => {
  if (!reader || !video || video.readyState < 2 || video.videoWidth <= 0) {
    return false;
  }

  const result = reader.decode(video);
  const isbn = String(result?.getText?.() ?? "").replace(/\\D/g, "");

  // Both the primary and the fallback must honor the same EAN-13 checksum.
  if (!isValidIsbn13(isbn)) return false;

  onScan(isbn);
  return true;
};
