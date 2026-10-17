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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Student Exam Attempts & Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submissions, academic performance, and Claude AI integrity evaluations
          </p>
        </div>

        <button
          onClick={fetchAttempts}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        {/* Search input */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAttempts()}
            placeholder="Search student or roll number..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Attempt Statuses</option>
          <option value="in_progress">In Progress (Active)</option>
          <option value="submitted">Submitted</option>
          <option value="auto_submitted">Auto-Submitted (Timeout)</option>
        </select>

        {/* Risk filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Review Priorities</option>
          <option value="high">High Priority (&ge; 60)</option>
          <option value="medium">Review Recommended (30 - 59)</option>
          <option value="low">Low Priority (&lt; 30)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-medium">Student Name & Roll</th>
                <th className="py-3 px-4 font-medium">Exam</th>
                <th className="py-3 px-4 font-medium">Session Status</th>
                <th className="py-3 px-4 font-medium">Score</th>
                <th className="py-3 px-4 font-medium">Telemetry Risk</th>
                <th className="py-3 px-4 font-medium">Claude 3.5 AI Review</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin text-indigo-400 mx-auto mb-2" />
                    Loading student attempts...
                  </td>
                </tr>
              ) : attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <tr
                    key={attempt._id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {attempt.studentId?.name || "Student"}
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {attempt.studentId?.studentId || "N/A"} • {attempt.studentId?.department || ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {attempt.examId?.title?.slice(0, 26)}...
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          attempt.status === "submitted"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : attempt.status === "in_progress"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {attempt.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {attempt.status === "in_progress"
                        ? "Pending"
                        : `${attempt.score || 0} / ${attempt.totalMarks || 0}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge score={attempt.riskScore || 0} />
                    </td>
                    <td className="py-3.5 px-4">
                      {attempt.aiAnalysis?.summary ? (
                        <button
                          onClick={() => setSelectedAIModal(attempt.aiAnalysis)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-medium hover:bg-indigo-900 transition-colors cursor-pointer"
                        >
                          <Bot className="h-3.5 w-3.5" />
                          View AI Report
                        </button>
                      ) : (
                        <button
                          disabled={runningAIId === attempt._id}
                          onClick={() => handleRunAI(attempt._id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          {runningAIId === attempt._id ? "Evaluating..." : "Run Claude"}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/teacher/reviews?examId=${attempt.examId?._id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                      >
                        Evidence
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No attempts found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claude AI Report Modal */}
      {selectedAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Student Activity & Violation Reasons
                </h3>
              </div>
              <button
                onClick={() => setSelectedAIModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Logged Unauthorized Activities ({selectedAIModal.keyConcerns?.length || 0})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedAIModal.riskLevel === "high"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  {selectedAIModal.riskLevel || "Flagged"} Risk
                </span>
              </div>

              {selectedAIModal.keyConcerns?.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {selectedAIModal.keyConcerns.map((concern, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-start gap-3 shadow-sm"
                    >
                      <span className="h-5 w-5 rounded-md bg-rose-950 border border-rose-800 text-rose-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {i + 1}
                      </span>
                      <p className="font-medium text-xs leading-relaxed text-slate-200">
                        {concern}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
                  ✅ No unauthorized activities detected during the exam session.
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAIModal(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
