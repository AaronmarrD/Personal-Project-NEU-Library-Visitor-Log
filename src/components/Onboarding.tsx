import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { COLLEGES, VISITOR_ROLES } from "../config";
import { UserCircle, Users, Shield } from "lucide-react";
const NEU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/New_Era_University.svg/250px-New_Era_University.svg.png";

export function ProfileSetup() {
  const { currentUser, completeProfile } = useAuth();
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [role, setRole] = useState<string>("Student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !program) return;
    completeProfile({ college, program, role: role as "Student" | "Faculty" | "Staff" | "Employee" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">
        <div className="text-center mb-8">
          {currentUser?.picture ? (
            <img
              src={currentUser.picture}
              alt=""
              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-blue-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserCircle className="w-20 h-20 text-blue-400 mx-auto mb-3" />
          )}
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-1">{currentUser?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {VISITOR_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    role === r
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              College / Department
            </label>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            >
              <option value="">Select college…</option>
              {COLLEGES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Program / Position
            </label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. BS Computer Science, Professor, Librarian…"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-base hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            Save &amp; Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export function RoleSelector() {
  const { currentUser, setView, setIsAdmin } = useAuth();

  const enterAsUser = () => {
    setIsAdmin(false);
    setView("user-welcome");
  };
  const enterAsAdmin = () => {
    setIsAdmin(true);
    setView("admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-5 shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {currentUser?.name?.split(" ")[0]}!
        </h2>
        <p className="text-gray-500 mt-1 mb-8">Choose how you'd like to access the system</p>

        <div className="grid gap-4">
          {}
          <button
            onClick={enterAsUser}
            className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition shrink-0">
              <Users className="w-7 h-7 text-emerald-700" />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-lg">Regular User</div>
              <div className="text-sm text-gray-500">Log your library visit</div>
            </div>
          </button>

          {}
          <button
            onClick={enterAsAdmin}
            className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
          >
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition shrink-0">
              <Shield className="w-7 h-7 text-indigo-700" />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-lg">Administrator</div>
              <div className="text-sm text-gray-500">View statistics &amp; manage visitors</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
