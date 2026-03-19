import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { GOOGLE_CLIENT_ID } from "./config";
import { seedDataIfNeeded } from "./data";

import LoginPage from "./components/LoginPage";
import { ProfileSetup, RoleSelector } from "./components/Onboarding";
import { UserWelcome, ReasonSelection, VisitConfirmed } from "./components/UserFlow";
import AdminDashboard from "./components/AdminDashboard";

// Seed sample data on first load
seedDataIfNeeded();

/* ── View router (driven by auth state) ────────────────────────────────────── */
function AppRouter() {
  const { currentView } = useAuth();

  switch (currentView) {
    case "login":
      return <LoginPage />;
    case "profile-setup":
      return <ProfileSetup />;
    case "role-select":
      return <RoleSelector />;
    case "user-welcome":
      return <UserWelcome />;
    case "user-reason":
      return <ReasonSelection />;
    case "user-confirmed":
      return <VisitConfirmed />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <LoginPage />;
  }
}

/* ── Root App ──────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
