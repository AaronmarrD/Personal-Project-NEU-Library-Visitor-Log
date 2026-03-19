import { useAuth } from "../context/AuthContext";
import { LogOut, ArrowLeftRight } from "lucide-react";
const NEU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/New_Era_University.svg/250px-New_Era_University.svg.png";

export default function Header() {
  const { currentUser, isAdmin, logout, setView, setIsAdmin, isAdminEmail } = useAuth();

  const switchRole = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setView("user-welcome");
    } else {
      setIsAdmin(true);
      setView("admin");
    }
  };

  const showSwitch = currentUser && isAdminEmail(currentUser.email);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200 p-0.5">
            <img src={NEU_LOGO} alt="NEU" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-gray-900 text-sm">NEU Library</span>
            <span className="block text-[11px] text-gray-400 -mt-0.5">
              {isAdmin ? "Admin Dashboard" : "Visitor Log"}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3">
          {showSwitch && (
            <button
              onClick={switchRole}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Switch to {isAdmin ? "User" : "Admin"}
            </button>
          )}

          {currentUser?.picture && (
            <img
              src={currentUser.picture}
              alt=""
              className="w-8 h-8 rounded-full border-2 border-gray-200"
              referrerPolicy="no-referrer"
            />
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
