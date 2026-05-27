import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name: string, avatar?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// Configurable Backend API host (Change to match development host)
// export const BACKEND_URL = 'http://localhost:5000';
export const BACKEND_URL = "http://10.0.2.2:5000";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, name: string, avatar?: string) => {
    set({ isLoading: true });
    try {
      // Call mock or real backend auth endpoint
      const response = await fetch(`${BACKEND_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, avatar }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed on backend");
      }

      const data = await response.json();

      // Save to AsyncStorage
      await AsyncStorage.setItem("eye1_token", data.token);
      await AsyncStorage.setItem("eye1_user", JSON.stringify(data.user));

      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      console.error("Login Store Error:", err);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("eye1_token");
      await AsyncStorage.removeItem("eye1_user");
    } catch (err) {
      console.error("Logout Storage Error:", err);
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const savedToken = await AsyncStorage.getItem("eye1_token");
      const savedUserStr = await AsyncStorage.getItem("eye1_user");

      if (savedToken && savedUserStr) {
        set({
          token: savedToken,
          user: JSON.parse(savedUserStr),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Initialize Auth Error:", err);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
