import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { VISIT_REASONS, COLLEGES } from "../config";
import { VisitLog, UserProfile, StatsFilter, DateFilterType } from "../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  UserCheck,
  GraduationCap,
  Briefcase,
  CalendarDays,
  CalendarRange,
  Calendar,
  Search,
  FileDown,
  ShieldBan,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  UserCog,
  X,
  TrendingUp,
  Building2,
} from "lucide-react";
import Header from "./Header";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return startOfDay(new Date(d.getFullYear(), d.getMonth(), diff));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isEmployee(role: string) {
  return ["Faculty", "Staff", "Employee"].includes(role);
}

/* ── Filter logic ─────────────────────────────────────────────────────────── */
function filterLogs(logs: VisitLog[], f: StatsFilter): VisitLog[] {
  const now = new Date();
  return logs.filter((log) => {
    const d = new Date(log.timestamp);

    // Date
    if (f.dateFilter === "today" && startOfDay(d).getTime() !== startOfDay(now).getTime())
      return false;
    if (f.dateFilter === "week" && d < startOfWeek(now)) return false;
    if (f.dateFilter === "custom") {
      if (f.customStart && d < new Date(f.customStart)) return false;
      if (f.customEnd) {
        const end = new Date(f.customEnd);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
    }

    // Reason
    if (f.reason && log.reason !== f.reason) return false;

    // College
    if (f.college && log.college !== f.college) return false;

    // Employee only
    if (f.employeeOnly && !isEmployee(log.visitorRole)) return false;

    return true;
  });
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── Bar chart (pure CSS) ─────────────────────────────────────────────────── */
function HorizontalBar({
  data,
  title,
  icon,
}: {
  data: { label: string; value: number }[];
  title: string;
  icon: React.ReactNode;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      {data.length === 0 && <p className="text-sm text-gray-400">No data available</p>}
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-36 text-xs font-medium text-gray-600 truncate shrink-0 text-right">
              {d.label}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-7 rounded-full transition-all duration-500 flex items-center justify-end pr-2 min-w-[2rem]"
                style={{ width: `${Math.max((d.value / max) * 100, 8)}%` }}
              >
                <span className="text-[11px] font-bold text-white">{d.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { visitLogs, getAllProfiles, blockUser, unblockUser } = useData();

  // Filters
  const [filters, setFilters] = useState<StatsFilter>({
    dateFilter: "today",
    customStart: "",
    customEnd: "",
    reason: "",
    college: "",
    employeeOnly: false,
  });

  // Tabs
  const [tab, setTab] = useState<"stats" | "logs" | "visitors">("stats");

  // Search for logs
  const [logSearch, setLogSearch] = useState("");

  // Block modal
  const [blockModal, setBlockModal] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState("");

  // Refresh profiles
  const [profileKey, setProfileKey] = useState(0);
  const profiles = useMemo(() => getAllProfiles(), [getAllProfiles, profileKey]);

  /* Filtered logs */
  const filtered = useMemo(() => filterLogs(visitLogs, filters), [visitLogs, filters]);

  /* Search within logs tab */
  const searchedLogs = useMemo(() => {
    if (!logSearch) return filtered;
    const q = logSearch.toLowerCase();
    return filtered.filter(
      (l) =>
        l.visitorName.toLowerCase().includes(q) ||
        l.program.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.college.toLowerCase().includes(q) ||
        l.visitorEmail.toLowerCase().includes(q),
    );
  }, [filtered, logSearch]);

  /* Computed stats */
  const stats = useMemo(() => {
    const unique = new Set(filtered.map((l) => l.visitorEmail)).size;
    const students = filtered.filter((l) => l.visitorRole === "Student").length;
    const faculty = filtered.filter((l) => l.visitorRole === "Faculty").length;
    const staff = filtered.filter((l) => isEmployee(l.visitorRole)).length;

    // By reason
    const reasonMap = new Map<string, number>();
    filtered.forEach((l) => reasonMap.set(l.reason, (reasonMap.get(l.reason) || 0) + 1));
    const byReason = Array.from(reasonMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    // By college
    const collegeMap = new Map<string, number>();
    filtered.forEach((l) => collegeMap.set(l.college, (collegeMap.get(l.college) || 0) + 1));
    const byCollege = Array.from(collegeMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return { total: filtered.length, unique, students, faculty, staff, byReason, byCollege };
  }, [filtered]);

  /* Handlers */
  const setDateFilter = (df: DateFilterType) =>
    setFilters((p) => ({ ...p, dateFilter: df }));

  const handleBlock = () => {
    if (!blockModal || !blockReason.trim()) return;
    blockUser(blockModal.email, blockReason.trim());
    setBlockModal(null);
    setBlockReason("");
    setProfileKey((k) => k + 1);
  };

  const handleUnblock = (email: string) => {
    unblockUser(email);
    setProfileKey((k) => k + 1);
  };

  /* PDF export */
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("NEU Library Visitor Log Report", 14, 18);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString("en-PH")}`, 14, 25);

    const dateLabel =
      filters.dateFilter === "today"
        ? "Today"
        : filters.dateFilter === "week"
          ? "This Week"
          : `${filters.customStart || "Start"} – ${filters.customEnd || "End"}`;
    doc.text(`Period: ${dateLabel}`, 14, 30);

    if (filters.reason) doc.text(`Reason: ${filters.reason}`, 100, 30);
    if (filters.college) doc.text(`College: ${filters.college}`, 14, 35);
    if (filters.employeeOnly) doc.text(`Employees Only`, 200, 30);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Name", "Email", "College", "Program", "Role", "Reason", "Date", "Time"]],
      body: searchedLogs.map((l, i) => [
        i + 1,
        l.visitorName,
        l.visitorEmail,
        l.college,
        l.program,
        l.visitorRole,
        l.reason,
        formatDate(l.timestamp),
        formatTime(l.timestamp),
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("NEU_Library_Report.pdf");
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── FILTERS BAR ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Filters
          </h2>

          {/* Date filter */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 mr-1">Period:</span>
            {(
              [
                ["today", "Today", <CalendarDays key="d" className="w-3.5 h-3.5" />],
                ["week", "This Week", <CalendarRange key="w" className="w-3.5 h-3.5" />],
                ["custom", "Custom Range", <Calendar key="c" className="w-3.5 h-3.5" />],
              ] as [DateFilterType, string, React.ReactNode][]
            ).map(([key, label, ico]) => (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filters.dateFilter === key
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ico} {label}
              </button>
            ))}

            {filters.dateFilter === "custom" && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={filters.customStart}
                  onChange={(e) => setFilters((p) => ({ ...p, customStart: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={filters.customEnd}
                  onChange={(e) => setFilters((p) => ({ ...p, customEnd: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
                />
              </div>
            )}
          </div>

          {/* Other filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.reason}
              onChange={(e) => setFilters((p) => ({ ...p, reason: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              <option value="">All Reasons</option>
              {VISIT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={filters.college}
              onChange={(e) => setFilters((p) => ({ ...p, college: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              <option value="">All Colleges</option>
              {COLLEGES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.employeeOnly}
                onChange={(e) => setFilters((p) => ({ ...p, employeeOnly: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Employees only (Faculty / Staff)
            </label>
          </div>
        </div>

        {/* ── STAT CARDS ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            label="Total Visits"
            value={stats.total}
            color="bg-blue-100"
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6 text-indigo-600" />}
            label="Unique Visitors"
            value={stats.unique}
            color="bg-indigo-100"
          />
          <StatCard
            icon={<GraduationCap className="w-6 h-6 text-emerald-600" />}
            label="Student Visits"
            value={stats.students}
            color="bg-emerald-100"
          />
          <StatCard
            icon={<Briefcase className="w-6 h-6 text-amber-600" />}
            label="Faculty Visits"
            value={stats.faculty}
            color="bg-amber-100"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-rose-600" />}
            label="Employee Visits"
            value={stats.staff}
            color="bg-rose-100"
          />
        </div>

        {/* ── TABS ──────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-4">
          {(
            [
              ["stats", "Statistics", <BarChart3 key="s" className="w-4 h-4" />],
              ["logs", "Visit Logs", <ClipboardList key="l" className="w-4 h-4" />],
              ["visitors", "Manage Visitors", <UserCog key="v" className="w-4 h-4" />],
            ] as [typeof tab, string, React.ReactNode][]
          ).map(([key, label, ico]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {ico} {label}
            </button>
          ))}
        </div>

        {/* ── TAB: Statistics ───────────────────────────────────────────── */}
        {tab === "stats" && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-up">
            <HorizontalBar
              data={stats.byReason}
              title="Visits by Reason"
              icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
            />
            <HorizontalBar
              data={stats.byCollege}
              title="Visits by College"
              icon={<Building2 className="w-5 h-5 text-indigo-600" />}
            />
          </div>
        )}

        {/* ── TAB: Visit Logs ──────────────────────────────────────────── */}
        {tab === "logs" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-up">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search name, program, reason, college…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={exportPDF}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow"
              >
                <FileDown className="w-4 h-4" /> Export PDF
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-400">
                        No visit logs found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    searchedLogs.map((log, idx) => (
                      <tr
                        key={log.id}
                        className="border-t border-gray-50 hover:bg-blue-50/40 transition"
                      >
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{log.visitorName}</td>
                        <td className="px-4 py-3 text-gray-500">{log.visitorEmail}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                          {log.college}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{log.program}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              log.visitorRole === "Student"
                                ? "bg-emerald-100 text-emerald-700"
                                : log.visitorRole === "Faculty"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {log.visitorRole}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.reason}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatTime(log.timestamp)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-right">
              Showing {searchedLogs.length} of {filtered.length} records
            </div>
          </div>
        )}

        {/* ── TAB: Manage Visitors ─────────────────────────────────────── */}
        {tab === "visitors" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        No registered visitors yet.
                      </td>
                    </tr>
                  ) : (
                    profiles.map((v) => (
                      <tr
                        key={v.email}
                        className="border-t border-gray-50 hover:bg-blue-50/40 transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                        <td className="px-4 py-3 text-gray-500">{v.email}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                          {v.college}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              v.role === "Student"
                                ? "bg-emerald-100 text-emerald-700"
                                : v.role === "Faculty"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {v.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {v.isBlocked ? (
                            <span className="text-red-600 text-xs font-semibold flex items-center gap-1">
                              <ShieldBan className="w-3.5 h-3.5" /> Blocked
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {v.isBlocked ? (
                            <button
                              onClick={() => handleUnblock(v.email)}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition px-3 py-1 rounded-lg hover:bg-emerald-50"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBlockModal(v);
                                setBlockReason("");
                              }}
                              className="text-xs font-semibold text-red-600 hover:text-red-800 transition px-3 py-1 rounded-lg hover:bg-red-50"
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── BLOCK MODAL ──────────────────────────────────────────────────── */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Block Visitor</h3>
              <button
                onClick={() => setBlockModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              You are about to block <strong>{blockModal.name}</strong> ({blockModal.email}).
            </p>
            <p className="text-sm text-gray-500 mb-4">
              They will see a denial message and will not be able to use the library.
            </p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking…"
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setBlockModal(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={!blockReason.trim()}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
