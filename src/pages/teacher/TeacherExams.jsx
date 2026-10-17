import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  Archive,
  RefreshCw,
  Sparkles,
  Award,
  Users,
} from "lucide-react";

export const TeacherExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exams");
      setExams(res.data.data || []);
    } catch (err) {
      console.error("Failed to load exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handlePublish = async (examId) => {
    try {
      await api.post(`/exams/${examId}/publish`);
      fetchExams();
    } catch (err) {
      alert("Failed to publish: " + (err.response?.data?.message || err.message));
    }
  };

  const handleArchive = async (examId) => {
    try {
      await api.post(`/exams/${examId}/archive`);
      fetchExams();
    } catch (err) {
      alert("Failed to archive: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium mb-2 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Curriculum Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Manage Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Create, configure AI telemetry options, publish test papers, and inspect student attempts
          </p>
        </div>

        <Link
          to="/teacher/exams/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-400 hover:to-violet-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] transition-all self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Exam</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl">
          <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
          <span className="text-xs font-mono">Loading examination schedules...</span>
        </div>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-slate-950/70 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.18)] flex flex-col justify-between space-y-4 transition-all group relative overflow-hidden"
            >
              {/* Subtle top laser glow line */}
              <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      exam.status === "published"
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "bg-purple-950/80 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {exam.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-purple-400" />
                    {exam.durationMinutes} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 font-heading">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {exam.description || "No description provided."}
                </p>
              </div>

              {/* Stats & Questions Strip */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-900/70 border border-white/10 text-[11px] text-slate-300 font-mono">
                <div className="text-center">
                  <span className="block text-[10px] text-slate-500 font-sans uppercase">Questions</span>
                  <span className="font-semibold text-purple-300">{exam.questions?.length || 0}</span>
                </div>
                <div className="text-center border-x border-white/10">
                  <span className="block text-[10px] text-slate-500 font-sans uppercase">Attempts</span>
                  <span className="font-semibold text-slate-200">{exam.stats?.totalAttempts || 0}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-slate-500 font-sans uppercase">Marks</span>
                  <span className="font-semibold text-amber-300">{exam.totalMarks || 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                {exam.status === "draft" && (
                  <button
                    onClick={() => handlePublish(exam._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Publish
                  </button>
                )}

                {exam.status === "published" && (
                  <button
                    onClick={() => handleArchive(exam._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5 text-slate-400" />
                    Archive
                  </button>
                )}

                <Link
                  to={`/teacher/attempts?examId=${exam._id}`}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Results</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-dashed border-white/10 text-slate-400 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white font-heading">No Examinations Published</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by creating your first online proctored examination for your students.
          </p>
          <Link
            to="/teacher/exams/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Exam Now</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TeacherExams;
