import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Modal from "../../../../shared/components/Modal/Modal.jsx";
import AppPanel from "../../../../shared/components/AppPanel/AppPanel.jsx";
import Icon from "../../../../shared/components/Icon/Icon.jsx";

import {
  getBookFiles,
  uploadBookFile,
  downloadBookFile,
} from "../../api/bookFilesApi.js";

import EbookReader from "../EbookReader/EbookReader.jsx";
import "./BookFilesModal.css";

const BookFilesModal = ({ book, libraryId, canEdit, onClose }) => {
  const [files, setFiles] = useState([]);
  const [readingFile, setReadingFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setСкачатиingId] = useState(null);

  useEffect(() => {
    let active = true;

    getBookFiles(libraryId, book.id)
      .then((data) => {
        if (active) setFiles(data);
      })
      .catch(() => {
        if (active) toast.error("\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043e\u0442\u0440\u0438\u043c\u0430\u0442\u0438 \u0444\u0430\u0439\u043b\u0438");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [libraryId, book.id]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      await uploadBookFile(libraryId, book.id, file);
      const updated = await getBookFiles(libraryId, book.id);
      setFiles(updated);
      toast.success("File uploaded");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleСкачати = async (file) => {
    setСкачатиingId(file.id);

    try {
      const blob = await downloadBookFile(libraryId, book.id, file.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.message || "Скачати failed");
    } finally {
      setСкачатиingId(null);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={"\u0415\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0456 \u0444\u043e\u0440\u043c\u0430\u0442\u0438"}
      subtitle={book.title}
      className="book-files-modal"
    >
      <div className="book-files-modal__body">
        {loading ? (
          <p>Завантаження...</p>
        ) : files.length === 0 ? (
          <p>Електронних файлів поки немає</p>
        ) : (
          <div className="book-files-modal__list">
            {files.map((file) => (
              <AppPanel
                key={file.id}
                variant="secondary"
                className="book-files-modal__file"
              >
                <div className="book-files-modal__file-info">
                  <span className="book-files-modal__file-icon">
                    <Icon name="book" />
                  </span>

                  <div className="book-files-modal__file-details">
                    <strong>{file.fileName}</strong>
                    <span>
                      {file.format} · {Math.ceil(Number(file.sizeBytes) / 1024)} KB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="book-files-modal__download"
                  onClick={() => setReadingFile(file)}
                  disabled={file.format !== "EPUB"}
                >
                  <Icon name="book" />
                  {file.format === "EPUB"
                    ? "\u0427\u0438\u0442\u0430\u0442\u0438"
                    : "\u0421\u043a\u043e\u0440\u043e"}
                </button>
              </AppPanel>
            ))}
          </div>
        )}

        {canEdit && (
          <AppPanel
            variant="secondary"
            className="book-files-modal__upload"
          >
            <Icon name="download" />
            <strong>Додати електронну книгу</strong>
            <span>EPUB, FB2, PDF · до 50 МБ</span>

            <label className="book-files-modal__upload-button">
              {uploading ? "Завантаження..." : "Вибрати файл"}
              <input
                type="file"
                accept=".epub,.fb2,.pdf"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </AppPanel>
        )}
      </div>

      {readingFile && (
        <EbookReader
          file={readingFile}
          book={book}
          libraryId={libraryId}
          onClose={() => setReadingFile(null)}
        />
      )}
    </Modal>
  );
};

export default BookFilesModal;
