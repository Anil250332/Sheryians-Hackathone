import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api.js";
import { RiskBadge } from "../../components/RiskBadge.jsx";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Bot,
  Eye,
  CheckCircle,
  FileText,
} from "lucide-react";

export const AttemptsList = () => {
  const [searchParams] = useSearchParams();
  const examIdParam = searchParams.get("examId") || "";

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [selectedAIModal, setSelectedAIModal] = useState(null);
  const [runningAIId, setRunningAIId] = useState(null);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (examIdParam) params.append("examId", examIdParam);
      if (statusFilter) params.append("status", statusFilter);
      if (riskFilter) params.append("riskLevel", riskFilter);
      if (search) params.append("search", search);

      const res = await api.get(`/teacher/attempts?${params.toString()}`);
      setAttempts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [examIdParam, statusFilter, riskFilter]);

  const handleRunAI = async (attemptId) => {
    try {
      setRunningAIId(attemptId);
      const res = await api.post(`/attempts/${attemptId}/ai-analysis`);
      setSelectedAIModal(res.data.data.aiAnalysis);
      fetchAttempts();
    } catch (err) {
      alert("AI Analysis failed: " + (err.response?.data?.message || err.message));
    } finally {
      setRunningAIId(null);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-2 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Audit Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Student Exam Attempts & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Review academic scores, recorded camera telemetry, and automated AI integrity evaluations
          </p>
        </div>

        <button
          onClick={fetchAttempts}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-purple-400/40 text-slate-300 hover:text-white text-xs font-mono font-medium cursor-pointer transition-all self-start sm:self-auto active:scale-95 shadow-md"
        >
          <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-md">
        {/* Search input */}
        <div className="relative">
          <Search className="h-4 w-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAttempts()}
            placeholder="Search student or roll number..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-400"
        >
          <option value="">All Attempt Statuses</option>
          <option value="in_progress">In Progress (Active)</option>
          <option value="submitted">Submitted</option>
          <option value="auto_submitted">Auto-Submitted (Timeout / 3 Warnings)</option>
        </select>

        {/* Risk filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-400"
        >
          <option value="">All Review Priorities</option>
          <option value="high">High Priority (≥ 60)</option>
          <option value="medium">Review Recommended (30 - 59)</option>
          <option value="low">Low Priority (&lt; 30)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative">
        {/* Subtle top laser glow line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/50 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Student Name & Roll</th>
                <th className="py-3.5 px-4 font-semibold">Exam Title</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Score</th>
                <th className="py-3.5 px-4 font-semibold">Telemetry Risk</th>
                <th className="py-3.5 px-4 font-semibold">AI Evaluation</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin text-purple-400 mx-auto mb-2" />
                    <span className="font-mono text-xs">Loading telemetry records...</span>
                  </td>
                </tr>
              ) : attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <tr
                    key={attempt._id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-white">
                      {attempt.studentId?.name || "Student"}
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        {attempt.studentId?.studentId || "N/A"} • {attempt.studentId?.department || ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {attempt.examId?.title?.slice(0, 26)}...
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          attempt.status === "submitted"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                            : attempt.status === "in_progress"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-500/40 animate-pulse"
                            : "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {attempt.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-300 font-mono">
                      {attempt.status === "in_progress"
                        ? "Pending"
                        : `${attempt.score || 0} / ${attempt.totalMarks || 0} pts`}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge score={attempt.riskScore || 0} />
                    </td>
                    <td className="py-3.5 px-4">
                      {attempt.aiAnalysis?.summary ? (
                        <button
                          onClick={() => setSelectedAIModal(attempt.aiAnalysis)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 text-purple-200 border border-purple-500/40 text-[11px] font-mono font-semibold hover:bg-purple-900 transition-colors cursor-pointer shadow-sm"
                        >
                          <Bot className="h-3.5 w-3.5 text-purple-400" />
                          <span>View Report</span>
                        </button>
                      ) : (
                        <button
                          disabled={runningAIId === attempt._id}
                          onClick={() => handleRunAI(attempt._id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-600 text-slate-300 hover:text-white border border-white/10 hover:border-transparent text-[11px] font-mono font-medium transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="h-3 w-3 text-purple-400" />
                          <span>{runningAIId === attempt._id ? "Evaluating..." : "Run AI"}</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/teacher/reviews?examId=${attempt.examId?._id}`}
                        className="px-3 py-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        <span>Evidence</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No attempts found matching the current search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claude AI Report Modal */}
      {selectedAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-[#090d18]/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Top laser accent line */}
            <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-heading">
                    AI Integrity Evaluation Report
                  </h3>
                  <p className="text-[10px] text-purple-300/70 font-mono">Automated behavioral analysis</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAIModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Logged Irregularities ({selectedAIModal.keyConcerns?.length || 0})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    selectedAIModal.riskLevel === "high"
                      ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                      : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {selectedAIModal.riskLevel || "Flagged"} Risk
                </span>
              </div>

              {selectedAIModal.keyConcerns?.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedAIModal.keyConcerns.map((concern, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-slate-200 flex items-start gap-3 shadow-sm"
                    >
                      <span className="h-5 w-5 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {i + 1}
                      </span>
                      <p className="font-medium text-xs leading-relaxed text-slate-200">
                        {concern}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center text-slate-400 text-xs font-mono">
                  ✅ No unauthorized activities detected during the exam session.
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAIModal(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold rounded-full text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer active:scale-95"
              >
                Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptsList;
