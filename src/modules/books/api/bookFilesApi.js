import { apiFetch } from "../../../shared/api/apiClient.js";

const filesPath = (libraryId, bookId) =>
  `/api/libraries/${encodeURIComponent(libraryId)}/books/${encodeURIComponent(bookId)}/files`;

export const getBookFiles = (libraryId, bookId) =>
  apiFetch(filesPath(libraryId, bookId));

export const uploadBookFile = (libraryId, bookId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch(filesPath(libraryId, bookId), {
    method: "POST",
    body: formData,
  });
};

export const downloadBookFile = (libraryId, bookId, fileId) =>
  apiFetch(
    `${filesPath(libraryId, bookId)}/${encodeURIComponent(fileId)}/download`,
    { responseType: "blob" },
  );
