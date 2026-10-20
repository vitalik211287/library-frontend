import { describe, expect, it, vi } from "vitest";
import { decodeEan13FromVideo } from "./decodeEan13FromVideo.js";

const video = { readyState: 4, videoWidth: 1280 };
const makeReader = (value) => ({
  decode: vi.fn(() => ({ getText: () => value })),
});

describe("EAN-13 scanner fallback", () => {
  it("accepts a valid book ISBN even when the primary decoder missed it", () => {
    const onScan = vi.fn();
    const reader = makeReader("9786171268982");

    expect(decodeEan13FromVideo({ reader, video, onScan })).toBe(true);
    expect(onScan).toHaveBeenCalledExactlyOnceWith("9786171268982");
    expect(reader.decode).toHaveBeenCalledWith(video);
  });

  it("still accepts another valid book ISBN", () => {
    const onScan = vi.fn();
    expect(decodeEan13FromVideo({
      reader: makeReader("9786171502789"), video, onScan,
    })).toBe(true);
  });

  it("rejects invalid ISBN checksum and non-book EAN-13", () => {
    const onScan = vi.fn();
    for (const value of ["9786171268983", "4006381333931"]) {
      expect(decodeEan13FromVideo({
        reader: makeReader(value), video, onScan,
      })).toBe(false);
    }
    expect(onScan).not.toHaveBeenCalled();
  });

  it("does not decode when the camera frame is not ready", () => {
    const onScan = vi.fn();
    const reader = makeReader("9786171268982");
    expect(decodeEan13FromVideo({
      reader, video: { readyState: 1, videoWidth: 1280 }, onScan,
    })).toBe(false);
    expect(reader.decode).not.toHaveBeenCalled();
    expect(onScan).not.toHaveBeenCalled();
  });

  it("does not accept an empty decode result", () => {
    const onScan = vi.fn();
    expect(decodeEan13FromVideo({
      reader: makeReader(""), video, onScan,
    })).toBe(false);
    expect(onScan).not.toHaveBeenCalled();
  });
});
