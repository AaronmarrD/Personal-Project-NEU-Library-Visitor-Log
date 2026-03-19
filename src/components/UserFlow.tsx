import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { VISIT_REASONS } from "../config";
import {
  BookOpen,
  Search,
  Monitor,
  UsersRound,
  GraduationCap,
  MessageSquare,
  Printer,
  HelpCircle,
  CheckCircle2,
  LogOut,
  ArrowRight,
} from "lucide-react";

const REASON_ICONS: Record<string, React.ReactNode> = {
  Reading: <BookOpen className="w-6 h-6" />,
  Researching: <Search className="w-6 h-6" />,
  "Use of Computer": <Monitor className="w-6 h-6" />,
  Meeting: <UsersRound className="w-6 h-6" />,
  Studying: <GraduationCap className="w-6 h-6" />,
  "Group Discussion": <MessageSquare className="w-6 h-6" />,
  "Printing / Photocopying": <Printer className="w-6 h-6" />,
  Other: <HelpCircle className="w-6 h-6" />,
};

export function UserWelcome() {
  const { currentUser, setView, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        {currentUser?.picture && (
          <img
            src={currentUser.picture}
            alt=""
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-100 shadow"
            referrerPolicy="no-referrer"
          />
        )}

        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome to NEU Library!</h1>

        <div className="mt-4 mb-6 space-y-1">
          <p className="text-lg font-semibold text-gray-800">{currentUser?.name}</p>
          <p className="text-sm text-gray-500">
            {currentUser?.role} · {currentUser?.program}
          </p>
          <p className="text-sm text-gray-400">{currentUser?.college}</p>
        </div>

        <button
          onClick={() => setView("user-reason")}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-base hover:from-emerald-700 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-2"
        >
          Log My Visit <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={logout}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function ReasonSelection() {
  const { currentUser, setView } = useAuth();
  const { addVisitLog } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    if (!selected) return;
    const reason = selected === "Other" ? customReason || "Other" : selected;

    addVisitLog({
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      visitorId: currentUser!.id,
      visitorName: currentUser!.name,
      visitorEmail: currentUser!.email,
      college: currentUser!.college,
      program: currentUser!.program,
      visitorRole: currentUser!.role,
      reason,
      timestamp: new Date().toISOString(),
    });

    setView("user-confirmed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Purpose of Visit</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Why are you visiting the library today?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {VISIT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setSelected(r)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                selected === r
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className={selected === r ? "text-emerald-600" : "text-gray-400"}>
                {REASON_ICONS[r]}
              </span>
              {r}
            </button>
          ))}
        </div>

        {selected === "Other" && (
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please specify your reason…"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || (selected === "Other" && !customReason)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-base hover:from-emerald-700 hover:to-teal-700 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export function VisitConfirmed() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-5">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Logged!</h2>
        <p className="text-gray-500 mb-8">
          Your library visit has been recorded. Enjoy your time at the NEU Library!
        </p>
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Done &amp; Sign Out
        </button>
      </div>
    </div>
  );
}
