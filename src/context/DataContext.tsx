import React, { createContext, useContext, useState, useCallback } from "react";
import { VisitLog, UserProfile } from "../types";

interface DataContextType {
  visitLogs: VisitLog[];
  addVisitLog: (log: VisitLog) => void;
  getAllProfiles: () => UserProfile[];
  blockUser: (email: string, reason: string) => void;
  unblockUser: (email: string) => void;
  reload: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>(() =>
    JSON.parse(localStorage.getItem("neu_visit_logs") || "[]"),
  );

  const reload = useCallback(() => {
    setVisitLogs(JSON.parse(localStorage.getItem("neu_visit_logs") || "[]"));
  }, []);

  const addVisitLog = useCallback((log: VisitLog) => {
    setVisitLogs((prev) => {
      const updated = [log, ...prev];
      localStorage.setItem("neu_visit_logs", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getAllProfiles = useCallback((): UserProfile[] => {
    const profiles: Record<string, UserProfile> = JSON.parse(
      localStorage.getItem("neu_profiles") || "{}",
    );
    return Object.values(profiles);
  }, []);

  const blockUser = useCallback((email: string, reason: string) => {
    const profiles: Record<string, UserProfile> = JSON.parse(
      localStorage.getItem("neu_profiles") || "{}",
    );
    if (profiles[email]) {
      profiles[email].isBlocked = true;
      profiles[email].blockReason = reason;
      localStorage.setItem("neu_profiles", JSON.stringify(profiles));
    }
  }, []);

  const unblockUser = useCallback((email: string) => {
    const profiles: Record<string, UserProfile> = JSON.parse(
      localStorage.getItem("neu_profiles") || "{}",
    );
    if (profiles[email]) {
      profiles[email].isBlocked = false;
      profiles[email].blockReason = "";
      localStorage.setItem("neu_profiles", JSON.stringify(profiles));
    }
  }, []);

  return (
    <DataContext.Provider value={{ visitLogs, addVisitLog, getAllProfiles, blockUser, unblockUser, reload }}>
      {children}
    </DataContext.Provider>
  );
};
