import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Setup global auth token getter for api client
setAuthTokenGetter(() => localStorage.getItem("auth_token"));

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));

  const { data: user, isLoading: isUserLoading, refetch, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (isError) {
      setToken(null);
      localStorage.removeItem("auth_token");
    }
  }, [isError]);

  const login = (newToken: string) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
  };

  const isLoading = isUserLoading && !!token;

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
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
