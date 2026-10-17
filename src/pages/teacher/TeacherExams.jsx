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
  ExternalLink,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Manage Examinations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, configure monitoring options, publish, and inspect attempts
          </p>
        </div>

        <Link
          to="/teacher/exams/create"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Exam
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
          Loading examinations...
        </div>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      exam.status === "published"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {exam.status}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {exam.durationMinutes} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {exam.description || "No description provided."}
                </p>
              </div>

              {/* Stats & Questions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{exam.questions?.length || 0} Questions</span>
                <span>{exam.stats?.totalAttempts || 0} Attempts</span>
                <span>{exam.totalMarks || 0} Marks</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                {exam.status === "draft" && (
                  <button
                    onClick={() => handlePublish(exam._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Publish Exam
                  </button>
                )}

                {exam.status === "published" && (
                  <button
                    onClick={() => handleArchive(exam._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </button>
                )}

                <Link
                  to={`/teacher/attempts?examId=${exam._id}`}
                  className="px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-medium transition-colors"
                >
                  Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
          <FileText className="h-10 w-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Exams Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first online proctored examination.
          </p>
          <Link
            to="/teacher/exams/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Create Exam Now
          </Link>
        </div>
      )}
    </div>
  );
};
