export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  college: string;
  program: string;
  role: "Student" | "Faculty" | "Staff" | "Employee";
  rfid?: string;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: string;
}

export interface VisitLog {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  college: string;
  program: string;
  visitorRole: string;
  reason: string;
  timestamp: string;
}

export type AppView =
  | "login"
  | "profile-setup"
  | "role-select"
  | "user-welcome"
  | "user-reason"
  | "user-confirmed"
  | "admin";

export type DateFilterType = "today" | "week" | "custom";

export interface StatsFilter {
  dateFilter: DateFilterType;
  customStart: string;
  customEnd: string;
  reason: string;
  college: string;
  employeeOnly: boolean;
}
