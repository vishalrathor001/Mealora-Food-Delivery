import { io } from "socket.io-client";

export const socket = io("https://mealora-backend.onrender.com", {
  autoConnect: false,        
  transports: ["websocket"], 
});
