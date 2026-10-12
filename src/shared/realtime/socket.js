import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  "https://insideofyou.pp.ua";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 5000,
  reconnectionDelayMax: 60000,
  randomizationFactor: 0.5,
});

let activeToken = null;

const isOnline = () => navigator.onLine !== false;

const reconnectIfNeeded = () => {
  if (activeToken && isOnline() && !socket.connected) {
    socket.connect();
  }
};

window.addEventListener("offline", () => {
  socket.disconnect();
});

window.addEventListener("online", reconnectIfNeeded);

socket.on("connect_error", () => {
  if (!isOnline()) {
    socket.disconnect();
  }
});

export const connectSocket = (token) => {
  if (!token) {
    disconnectSocket();
    return;
  }

  activeToken = token;
  socket.auth = { token };

  reconnectIfNeeded();
};

export const disconnectSocket = () => {
  activeToken = null;
  socket.disconnect();
  socket.auth = {};
};
