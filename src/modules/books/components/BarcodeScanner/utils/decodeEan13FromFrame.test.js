import { describe, expect, it, vi } from "vitest";
import * as zxing from "@zxing/library";
import {
  captureBarcodeRegion,
  decodeEan13FromPixels,
  enhanceLuminance,
  normalizeIsbn,
} from "./decodeEan13FromFrame.js";

// Genuine EAN-13 bar patterns, encoded as image pixels. Unlike tests that
// mock reader.decode(), these exercise ZXing's real 1D decoder.
const L = ["0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011"];
const G = ["0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = ["1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100"];
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

const renderEan13 = (isbn, dark = 0, light = 255) => {
  const parity = PARITY[Number(isbn[0])];
  const bits = "101" + [...isbn.slice(1, 7)]
    .map((digit, index) => (parity[index] === "L" ? L : G)[Number(digit)])
    .join("") + "01010" + [...isbn.slice(7)]
    .map((digit) => R[Number(digit)]).join("") + "101";
  const unit = 4;
  const padding = 16;
  const width = (bits.length + padding * 2) * unit;
  const height = 120;
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bit = Math.floor(x / unit) - padding;
      const value = y > 12 && y < height - 12 && bits[bit] === "1"
        ? dark : light;
      const offset = (y * width + x) * 4;
      rgba[offset] = rgba[offset + 1] = rgba[offset + 2] = value;
      rgba[offset + 3] = 255;
    }
  }
  return { rgba, width, height };
};

const decode = (image) => {
  const reader = new zxing.MultiFormatReader();
  reader.setHints(new Map([
    [zxing.DecodeHintType.POSSIBLE_FORMATS, [zxing.BarcodeFormat.EAN_13]],
    [zxing.DecodeHintType.TRY_HARDER, true],
  ]));
  return decodeEan13FromPixels({ ...image, zxing, reader });
};

describe("EAN-13 frame decoding", () => {
  it("normalizes and validates complete ISBN values", () => {
    expect(normalizeIsbn("978-617-12-6898-2")).toBe("9786171268982");
    expect(normalizeIsbn("9786171268983")).toBeNull();
    expect(normalizeIsbn("4006381333931")).toBeNull();
  });

  it("decodes an actual EAN-13 pixel image with the reported difficult ISBN", () => {
    expect(decode(renderEan13("9786171268982"))).toBe("9786171268982");
  });

  it("decodes low-contrast EAN-13 pixels", () => {
    expect(decode(renderEan13("9786171268982", 105, 155)))
      .toBe("9786171268982");
  });

  it("rejects blank frames", () => {
    expect(decode({ width: 10, height: 10,
      rgba: new Uint8ClampedArray(10 * 10 * 4).fill(255) })).toBeNull();
  });

  it("uses a central crop without starting another camera", () => {
    const drawImage = vi.fn();
    const canvas = { width: 0, height: 0,
      getContext: vi.fn(() => ({ drawImage })) };
    const video = { readyState: 4, videoWidth: 1920, videoHeight: 1080 };
    const result = captureBarcodeRegion({ video, canvas });
    expect(result).toMatchObject({ width: 1000, height: 375 });
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(
      video, 38, 194, 1843, 691, 0, 0, 1000, 375,
    );
  });

  it("does not capture before video metadata is ready", () => {
    expect(captureBarcodeRegion({ video: { readyState: 1 },
      canvas: {} })).toBeNull();
  });

  it("produces grayscale data with more dynamic range", () => {
    const rgba = new Uint8ClampedArray([
      100, 100, 100, 255, 150, 150, 150, 255,
    ]);
    const luminance = enhanceLuminance(rgba);
    expect(luminance[0]).toBe(0);
    expect(luminance[1]).toBe(255);
  });
});
