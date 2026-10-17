import { io } from "socket.io-client";

let socket = null;

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "https://sheriyansh-hackthon-backend.onrender.com";

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};
