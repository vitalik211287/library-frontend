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

// Server endpoint currently accepts MANUAL/PAGES sessions only (not EPUB).
export const syncOfflineManualSession = (bookId, body) =>
  apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/offline-sync`, {
    method: "POST",
    body,
  });
