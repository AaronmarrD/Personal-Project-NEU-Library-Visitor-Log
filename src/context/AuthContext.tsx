import React, { createContext, useContext, useState, useCallback } from "react";
import { UserProfile, AppView } from "../types";
import { ADMIN_EMAILS } from "../config";

function decodeJwt(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

interface AuthState {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  currentView: AppView;
  blockedMessage: string;
}

interface AuthContextType extends AuthState {
  loginWithGoogle: (credentialResponse: { credential?: string }) => void;
  logout: () => void;
  setView: (view: AppView) => void;
  setIsAdmin: (admin: boolean) => void;
  completeProfile: (data: Partial<UserProfile>) => void;
  isAdminEmail: (email: string) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    currentUser: null,
    isAdmin: false,
    currentView: "login",
    blockedMessage: "",
  });

  const isAdminEmail = useCallback(
    (email: string) => ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase()),
    [],
  );

  const loginWithGoogle = useCallback(
    (credentialResponse: { credential?: string }) => {
      if (!credentialResponse.credential) return;

      const decoded = decodeJwt(credentialResponse.credential) as {
        email: string;
        name: string;
        picture?: string;
        sub: string;
      };

      const { email, name, picture, sub } = decoded;

      const profiles: Record<string, UserProfile> = JSON.parse(
        localStorage.getItem("neu_profiles") || "{}",
      );
      const existing = profiles[email];

      if (existing) {
        if (existing.isBlocked) {
          setState((prev) => ({
            ...prev,
            currentUser: existing,
            blockedMessage: existing.blockReason || "You have been blocked from the library.",
            currentView: "login",
          }));
          return;
        }

        existing.name = name;
        if (picture) existing.picture = picture;
        profiles[email] = existing;
        localStorage.setItem("neu_profiles", JSON.stringify(profiles));

        setState((prev) => ({
          ...prev,
          currentUser: existing,
          blockedMessage: "",
          currentView: isAdminEmail(email) ? "role-select" : "user-welcome",
        }));
      } else {

        const newProfile: UserProfile = {
          id: sub,
          email,
          name,
          picture: picture || "",
          college: "",
          program: "",
          role: "Student",
          isBlocked: false,
          blockReason: "",
          createdAt: new Date().toISOString(),
        };
        setState((prev) => ({
          ...prev,
          currentUser: newProfile,
          blockedMessage: "",
          currentView: "profile-setup",
        }));
      }
    },
    [isAdminEmail],
  );

  const completeProfile = useCallback(
    (data: Partial<UserProfile>) => {
      setState((prev) => {
        const updated: UserProfile = { ...prev.currentUser!, ...data };
        const profiles: Record<string, UserProfile> = JSON.parse(
          localStorage.getItem("neu_profiles") || "{}",
        );
        profiles[updated.email] = updated;
        localStorage.setItem("neu_profiles", JSON.stringify(profiles));

        return {
          ...prev,
          currentUser: updated,
          currentView: isAdminEmail(updated.email) ? "role-select" : "user-welcome",
        };
      });
    },
    [isAdminEmail],
  );

  const refreshUser = useCallback(() => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const profiles: Record<string, UserProfile> = JSON.parse(
        localStorage.getItem("neu_profiles") || "{}",
      );
      const latest = profiles[prev.currentUser.email];
      return latest ? { ...prev, currentUser: latest } : prev;
    });
  }, []);

  const logout = useCallback(() => {
    setState({ currentUser: null, isAdmin: false, currentView: "login", blockedMessage: "" });
  }, []);

  const setView = useCallback((view: AppView) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  const setIsAdmin = useCallback((admin: boolean) => {
    setState((prev) => ({ ...prev, isAdmin: admin }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginWithGoogle,
        logout,
        setView,
        setIsAdmin,
        completeProfile,
        isAdminEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
