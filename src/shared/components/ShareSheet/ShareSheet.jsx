import { useState } from "react";
import { SiTelegram, SiWhatsapp, SiViber } from "react-icons/si";

import telegramIcon from "../../assets/share-icons/telegram-svgrepo-com.svg";
import whatsappIcon from "../../assets/share-icons/whatsapp-color-svgrepo-com.svg";
import viberIcon from "../../assets/share-icons/viber-svgrepo-com.svg";

import "./ShareSheet.css";

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
  </svg>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

const ShareSheet = ({
  isOpen,
  title = "Бібліотека",
  text = "",
  url = "",
  onClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) {
    return null;
  }

  const shareText = [text, url].filter(Boolean).join(" ");

  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const encodedFullText = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);

      window.setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy share link error:", error);
    }
  };

  const handleSystemShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });

        onClose?.();
        return;
      }

      await handleCopy();
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("System share error:", error);
      }
    }
  };

  const openShareUrl = (shareUrl) => {
    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer",
    );

    onClose?.();
  };

  const handleViber = () => {
    window.location.href =
      `viber://forward?text=${encodedFullText}`;

    onClose?.();
  };

  const handleEmail = () => {
    window.location.href =
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodedFullText}`;

    onClose?.();
  };

  return (
    <div
      className="share-sheet__backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="share-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Поділитися"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="share-sheet__handle" />

        <div className="share-sheet__header">
          <h2>Поділитися</h2>

          <button
            type="button"
            className="share-sheet__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <div className="share-sheet__grid">
          <button
            type="button"
            className="share-sheet__item"
            onClick={() =>
              openShareUrl(
                `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
              )
            }
          >
            <span className="share-sheet__icon">
              <SiTelegram />
            </span>
            <span>Telegram</span>
          </button>

          <button
            type="button"
            className="share-sheet__item"
            onClick={() =>
              openShareUrl(
                `https://wa.me/?text=${encodedFullText}`,
              )
            }
          >
            <span className="share-sheet__icon">
              <SiWhatsapp />
            </span>
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            className="share-sheet__item"
            onClick={handleViber}
          >
            <span className="share-sheet__icon">
              <SiViber />
            </span>
            <span>Viber</span>
          </button>

          <button
            type="button"
            className="share-sheet__item"
            onClick={handleEmail}
          >
            <span className="share-sheet__icon">
              <EmailIcon />
            </span>
            <span>Email</span>
          </button>

          <button
            type="button"
            className="share-sheet__item"
            onClick={handleCopy}
          >
            <span className="share-sheet__icon">
              <CopyIcon />
            </span>
            <span>
              {isCopied ? "Скопійовано" : "Копіювати"}
            </span>
          </button>

          <button
            type="button"
            className="share-sheet__item"
            onClick={handleSystemShare}
          >
            <span className="share-sheet__icon">
              <MoreIcon />
            </span>
            <span>Інші</span>
          </button>
        </div>

        <button
          type="button"
          className="share-sheet__cancel"
          onClick={onClose}
        >
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default ShareSheet;