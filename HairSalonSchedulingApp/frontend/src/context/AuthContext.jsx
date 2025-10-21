import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import Spinner from "../components/Spinner";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await axios.post(
        "/auth/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      return access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      throw error;
    }
  };

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const validateToken = async (token) => {
    if (!token) return false;
    try {
      // Set the token in axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get("/auth/profile");
      return response.data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          const response = await axios.get("/auth/profile");
          return response.data.user;
        } catch (refreshError) {
          return false;
        }
      }
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const userData = await validateToken(token);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (accessToken, refreshToken) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    const userData = await validateToken(accessToken);
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user_type", userData.user_type);
    } else {
      throw new Error("Invalid token");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_type");
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Successfully logged out");
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        userType: user?.user_type || localStorage.getItem("user_type"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
