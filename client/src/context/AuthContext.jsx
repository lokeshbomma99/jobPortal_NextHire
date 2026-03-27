import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const fetchUser = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      // handle both {user} and direct user object
      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      connectSocket(userData._id);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    // handle both {success,token,user} and {token,user}
    const token = data.token;
    const userData = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    connectSocket(userData._id);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    const token = data.token;
    const user = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    connectSocket(user._id);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket();
    window.location.href = "/";
  };

  const updateUser = (updatedUser) => {
    const userData = updatedUser.user || updatedUser;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};