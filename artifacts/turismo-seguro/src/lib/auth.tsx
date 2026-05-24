import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Usuario } from "@workspace/api-client-react";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
  updateUser: (user: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
    setIsReady(true);
  }, []);

  const login = (newUser: Usuario, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    localStorage.setItem("auth_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  const updateUser = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  if (!isReady) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
