import { afterAll, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import "fake-indexeddb/auto";

vi.stubGlobal("Blob", NodeBlob);

afterAll(() => {
  vi.unstubAllGlobals();
});
import { saveOfflineEpub, getOfflineEpub, getOfflineEpubsForBook } from "./offlineEpubStorage.js";

it("saves EPUB with metadata and discovers it while offline", async () => {
  const ids = {
    userId: "offline-epub-test-user",
    libraryId: "offline-epub-test-library",
    bookId: "offline-epub-test-book",
    fileId: "offline-epub-test-file",
  };
  const blob = new Blob(["test epub bytes"], { type: "application/epub+zip" });
  await saveOfflineEpub({
    ...ids,
    blob,
    title: "Offline book",
    book: { id: ids.bookId, title: "Offline book" },
    file: { id: ids.fileId, format: "EPUB", fileName: "book.epub" },
  });

  const single = await getOfflineEpub(ids);
  expect(single.blob.size).toBe(blob.size);
  expect(single.book.id).toBe(ids.bookId);
  expect(single.file.id).toBe(ids.fileId);

  const found = await getOfflineEpubsForBook(ids);
  expect(found).toHaveLength(1);
  expect(found[0].fileId).toBe(ids.fileId);
  expect(found[0].blob.size).toBe(blob.size);
});
