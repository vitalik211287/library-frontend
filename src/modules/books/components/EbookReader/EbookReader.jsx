import { lazy, Suspense, useEffect, useState } from "react";

import Modal from "../../../../shared/components/Modal/Modal.jsx";
import Loader from "../../../../shared/components/Loader/Loader.jsx";
import { downloadBookFile } from "../../api/bookFilesApi.js";

import "./EbookReader.css";

const EpubReader = lazy(() =>
  import("./EpubReader/EpubReader.jsx")
);

const EbookReader = ({ file, book, libraryId, onClose }) => {
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setBlob(null);
    setError("");

    downloadBookFile(libraryId, book.id, file.id)
      .then((data) => {
        if (active) setBlob(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Не вдалося завантажити книгу");
        }
      });

    return () => {
      active = false;
    };
  }, [libraryId, book.id, file.id]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={book.title}
      subtitle={file.fileName}
      className="ebook-reader-modal"
    >
      <div className="ebook-reader__content">
        {error ? (
          <p role="alert">{error}</p>
        ) : !blob ? (
          <Loader text="Відкриваємо книгу..." />
        ) : file.format === "EPUB" ? (
          <Suspense fallback={<Loader text="Завантажуємо читалку..." />}>
            <EpubReader blob={blob} />
          </Suspense>
        ) : (
          <p>Читалка для цього формату ще розробляється.</p>
        )}
      </div>
    </Modal>
  );
};

export default EbookReader;
