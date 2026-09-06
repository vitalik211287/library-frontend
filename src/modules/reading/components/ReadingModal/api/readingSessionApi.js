import { apiFetch } from "../../../../../shared/api/apiClient.js";

export const getReadingStats = (bookId) => apiFetch(`/api/user-books/${bookId}/reading/stats`);

export const getActiveReadingSession = (bookId) => apiFetch(`/api/user-books/${bookId}/reading/active`);

export const updateUserBook = (bookId, body) => apiFetch(`/api/user-books/${bookId}`, { method: "PATCH", body });

export const startReadingSession = (bookId, body) => apiFetch(`/api/user-books/${bookId}/reading/start`, { method: "POST", body });

export const pauseReadingSession = (bookId) => apiFetch(`/api/user-books/${bookId}/reading/pause`, { method: "POST" });

export const resumeReadingSession = (bookId) => apiFetch(`/api/user-books/${bookId}/reading/resume`, { method: "POST" });

export const finishReadingSession = (bookId, body) => apiFetch(`/api/user-books/${bookId}/reading/finish`, { method: "POST", body });
