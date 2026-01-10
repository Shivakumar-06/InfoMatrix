import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axiosClient from "../api/axiosClient";

interface User {
  id?: string;
  name?: string;
  email: string;
  role: "admin" | "client";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }

    setInitializing(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response =
        email === import.meta.env.VITE_ADMIN_EMAIL
          ? await axiosClient.post("/auth/admin-login", { email, password })
          : await axiosClient.post("/auth/client-login", { email, password });

      const { user, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;

      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosClient.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, loading, initializing }),
    [user, loading, initializing, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
