import { useEffect, useState } from "react";

import Modal from "../../../shared/components/Modal/Modal.jsx";
import {
  getPushPermission,
  isPushSupported,
  subscribeToPushNotifications,
} from "../services/pushNotifications.js";

import "./PushPermissionModal.css";

const DISMISSED_UNTIL_KEY = "push-permission-dismissed-until";
const DISMISS_DAYS = 14;

const PushPermissionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    if (!isPushSupported() || getPushPermission() !== "default") {
      return undefined;
    }

    const dismissedUntil = Number(
      localStorage.getItem(DISMISSED_UNTIL_KEY) || 0,
    );

    if (dismissedUntil > Date.now()) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleClose = () => {
    const dismissedUntil =
      Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;

    localStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(dismissedUntil),
    );

    setIsOpen(false);
  };

  const handleEnable = async () => {
    setIsOpen(false);
    setIsEnabling(true);

    try {
      await subscribeToPushNotifications();
    } catch (error) {
      console.error("Enable push notifications error:", error);
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="push-permission-modal"
      eyebrow={"\u0421\u043f\u043e\u0432\u0456\u0449\u0435\u043d\u043d\u044f"}
      title={"\u041d\u0435 \u043f\u0440\u043e\u043f\u0443\u0441\u043a\u0430\u0439\u0442\u0435 \u043d\u043e\u0432\u0438\u043d\u0438"}
    >
      <div className="push-permission-content">
        <div
          className="push-permission-content__icon"
          aria-hidden="true"
        >
          {"\ud83d\udd14"}
        </div>

        <p className="push-permission-content__text">
          {"\u041e\u0442\u0440\u0438\u043c\u0443\u0439\u0442\u0435 \u0441\u043f\u043e\u0432\u0456\u0449\u0435\u043d\u043d\u044f \u043f\u0440\u043e \u043d\u043e\u0432\u0456 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456, \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456, \u043f\u0456\u0434\u043f\u0438\u0441\u043a\u0438 \u0442\u0430 \u0440\u0435\u0430\u043a\u0446\u0456\u0457 \u2014 \u043d\u0430\u0432\u0456\u0442\u044c \u043a\u043e\u043b\u0438 \u0411\u0456\u0431\u043b\u0456\u043e\u0442\u0435\u043a\u0430 \u0437\u0430\u043a\u0440\u0438\u0442\u0430."}
        </p>

        <div className="push-permission-actions">
          <button
            type="button"
            className="push-permission-actions__primary"
            onClick={handleEnable}
            disabled={isEnabling}
          >
            {isEnabling
              ? "\u0423\u0432\u0456\u043c\u043a\u043d\u0435\u043d\u043d\u044f..."
              : "\u0423\u0432\u0456\u043c\u043a\u043d\u0443\u0442\u0438 \u0441\u043f\u043e\u0432\u0456\u0449\u0435\u043d\u043d\u044f"}
          </button>

          <button
            type="button"
            className="push-permission-actions__secondary"
            onClick={handleClose}
            disabled={isEnabling}
          >
            {"\u041d\u0435 \u0437\u0430\u0440\u0430\u0437"}
          </button>
        </div>
      </div>
    </Modal>
  )
};

export default PushPermissionModal;
