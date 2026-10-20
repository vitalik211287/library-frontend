import { isValidIsbn13 } from "./scannerHelpers.js";

export const normalizeIsbn = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return isValidIsbn13(digits) ? digits : null;
};

/**
 * Capture the central area of the existing video into an off-screen canvas.
 * Limits image size to keep scanning responsive on mobile devices.
 */
export const captureBarcodeRegion = ({ video, canvas }) => {
  if (!video || video.readyState < 2 || !video.videoWidth ||
      !video.videoHeight || !canvas) return null;

  const sourceWidth = Math.round(video.videoWidth * 0.96);
  const sourceHeight = Math.round(video.videoHeight * 0.64);
  const left = Math.floor((video.videoWidth - sourceWidth) / 2);
  const top = Math.floor((video.videoHeight - sourceHeight) / 2);
  const width = Math.min(sourceWidth, 1000);
  const height = Math.max(1, Math.round(sourceHeight * width / sourceWidth));

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(
    video, left, top, sourceWidth, sourceHeight, 0, 0, width, height,
  );
  return { context, width, height };
};

/**
 * Convert RGBA pixels to grayscale and stretch low-contrast camera images.
 * Histograms ignore the darkest/lightest 4% to reduce glare sensitivity.
 */
export const enhanceLuminance = (rgba) => {
  if (!rgba || rgba.length % 4 !== 0) return null;
  const pixels = rgba.length / 4;
  const output = new Uint8ClampedArray(pixels);
  const histogram = new Uint32Array(256);

  for (let offset = 0, index = 0; index < pixels; offset += 4, index++) {
    const gray = rgba[offset + 3] === 0
      ? 255
      : (77 * rgba[offset] + 150 * rgba[offset + 1] +
          29 * rgba[offset + 2]) >> 8;
    output[index] = gray;
    histogram[gray] += 1;
  }

  const cutoff = Math.floor(pixels * 0.04);
  let cumulative = 0;
  let low = 0;
  for (; low < 255; low++) {
    cumulative += histogram[low];
    if (cumulative > cutoff) break;
  }
  cumulative = 0;
  let high = 255;
  for (; high > 0; high--) {
    cumulative += histogram[high];
    if (cumulative > cutoff) break;
  }

  if (high - low < 12) return output;
  const scale = 255 / (high - low);
  for (let i = 0; i < pixels; i++) {
    output[i] = Math.max(0, Math.min(255, (output[i] - low) * scale));
  }
  return output;
};

/** Decode actual camera pixels with ZXing, not a mock return value. */
export const decodeEan13FromPixels = ({ rgba, width, height, zxing, reader }) => {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || rgba?.length !== width * height * 4 ||
      !zxing || !reader) return null;

  const source = new zxing.RGBLuminanceSource(
    enhanceLuminance(rgba), width, height,
  );

  for (const Binarizer of [
    zxing.HybridBinarizer,
    zxing.GlobalHistogramBinarizer,
  ]) {
    try {
      const bitmap = new zxing.BinaryBitmap(new Binarizer(source));
      const isbn = normalizeIsbn(reader.decodeWithState(bitmap)?.getText?.());
      if (isbn) return isbn;
    } catch (error) {
      if (!/NotFound|Checksum|FormatException/.test(error?.name ?? "")) {
        throw error;
      }
    } finally {
      reader.reset();
    }
  }
  return null;
};
