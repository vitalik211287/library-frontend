import { normalizeIsbn } from "./decodeEan13FromFrame.js";

/** Decode one frame without opening a second MediaStream. */
export const decodeEan13FromVideo = ({ reader, video, onScan }) => {
  if (!reader || !video || video.readyState < 2 || video.videoWidth <= 0) {
    return false;
  }

  const result = reader.decode(video);
  const isbn = normalizeIsbn(result?.getText?.());
  if (!isbn) return false;

  onScan(isbn);
  return true;
};
