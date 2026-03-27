import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { connectSocket, getSocket, disconnectSocket } from "../lib/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const s = connectSocket(user._id);
      setSocket(s);

      s.on("users:online", (users) => setOnlineUsers(users));

      return () => {
        s.off("users:online");
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setOnlineUsers([]);
    }
  }, [user]);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
