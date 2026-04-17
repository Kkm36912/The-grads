import { io } from "socket.io-client";

// Grabs your Vite backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socketInstance = null;
let voiceSocketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_URL, {
      transports: ["websocket"], // Force websocket to prevent the polling issues we fixed!
      reconnection: true,
    });

    // 🔥 ADD THE LOGS HERE
    socketInstance.on("connect", () => {
      console.log("🟢 [MAIN SOCKET] Connected! ID:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 [MAIN SOCKET] Connection Error:", err.message);
    });
  }
  return socketInstance;
};

export const getVoiceSocket = () => {
  if (!voiceSocketInstance) {
    voiceSocketInstance = io(`${API_URL}/voice`, {
      transports: ["websocket"],
      reconnection: true,
    });

    // 🔥 ADD THE LOGS HERE
    voiceSocketInstance.on("connect", () => {
      console.log("🟢 [VOICE SOCKET] Connected! ID:", voiceSocketInstance.id);
    });

    voiceSocketInstance.on("connect_error", (err) => {
      console.error("🔴 [VOICE SOCKET] Connection Error:", err.message);
    });
  }
  return voiceSocketInstance;
};
