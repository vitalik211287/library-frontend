import { apiFetch } from "../../../shared/api/apiClient.js";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((character) => character.charCodeAt(0)),
  );
};

export const isPushSupported = () =>
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const getPushPermission = () => {
  if (!isPushSupported()) {
    return "unsupported";
  }

  return Notification.permission;
};

export const subscribeToPushNotifications = async () => {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return {
      subscribed: false,
      permission,
    };
  }

  const registration = await navigator.serviceWorker.ready;

  const { publicKey } = await apiFetch(
    "/api/notifications/push-public-key",
    {
      auth: false,
    },
  );

  if (!publicKey) {
    throw new Error("Push public key is unavailable");
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await apiFetch("/api/notifications/push-subscription", {
    method: "POST",
    body: subscription.toJSON(),
  });

  return {
    subscribed: true,
    permission,
  };
};
