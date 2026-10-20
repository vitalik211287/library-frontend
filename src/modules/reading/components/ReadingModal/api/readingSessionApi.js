import { apiFetch } from "../../../../../shared/api/apiClient.js";

export const getReadingStats = (bookId) => apiFetch(`/api/user-books/${bookId}/reading/stats`);

export const getActiveReadingSession = (bookId) => apiFetch(`/api/user-books/${bookId}/reading/active`);

export const updateUserBook = (bookId, body) => apiFetch(`/api/user-books/${bookId}`, { method: "PATCH", body });

export const startReadingSession = (bookId, body) => apiFetch(`/api/user-books/${bookId}/reading/start`, { method: "POST", body });

export const pauseReadingSession = (bookId, readerLeaseId) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/pause`, {
    method: "POST",
    ...(readerLeaseId && { body: { readerLeaseId } }),
  });

export const resumeReadingSession = (bookId, readerLeaseId) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/resume`, {
    method: "POST",
    ...(readerLeaseId && { body: { readerLeaseId } }),
  });

export const heartbeatReadingSession = (bookId, sessionId, readerLeaseId) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/heartbeat`, {
    method: "POST",
    body: { sessionId, readerLeaseId },
  });

export const claimEbookReadingSession = (bookId, sessionId) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/claim`, {
    method: "POST",
    body: { sessionId },
  });

export const finishReadingSession = (bookId, body, readerLeaseId) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/finish`, {
    method: "POST",
    body: {
      ...body,
      ...(readerLeaseId && { readerLeaseId }),
    },
  });

// Existing manual reading endpoint accepts MANUAL/PAGES sessions only.
export const syncOfflineManualSession = (bookId, body) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/offline-sync`, {
    method: "POST",
    body,
  });

// EPUB uses a separate EBOOK/PERCENT endpoint with its own validation.
export const syncOfflineEbookSession = (bookId, body) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/offline-epub-sync`, {
    method: "POST",
    body,
  });

export const importManualReadingSession = (bookId, body) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/import`, {
    method: "POST",
    body,
  });