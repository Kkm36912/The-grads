import { io } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL || "https://the-grads.onrender.com";

let socketInstance = null;
let voiceSocketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_URL, {
      transports: ["websocket"],
      reconnection: true,

      // 🔥 AUTH (IMPORTANT)
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketInstance.on("connect", () => {
      console.log("🟢 [MAIN SOCKET] Connected!", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 [MAIN SOCKET] Error:", err.message);
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

    voiceSocketInstance.on("connect", () => {
      console.log("🟢 [VOICE SOCKET] Connected!", voiceSocketInstance.id);
    });

    voiceSocketInstance.on("connect_error", (err) => {
      console.error("🔴 [VOICE SOCKET] Error:", err.message);
    });
  }

  return voiceSocketInstance;
};
