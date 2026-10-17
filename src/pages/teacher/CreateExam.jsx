import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import {
  Plus,
  Trash2,
  Save,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Upload,
} from "lucide-react";

export const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [instructions, setInstructions] = useState(
    "1. Keep your camera focused on your face at all times.\n2. Do not switch or minimize tabs.\n3. Mobile phones and secondary individuals are strictly forbidden."
  );

  const [settings, setSettings] = useState({
    faceMonitoring: true,
    phoneDetection: true,
    tabMonitoring: true,
    captureSnapshots: true,
    noFaceThresholdSec: 5,
    lookingAwayThresholdSec: 5,
  });

  const [questions, setQuestions] = useState([
    {
      questionText: "What is the primary benefit of on-device browser AI processing?",
      options: [
        "Faster than all servers",
        "Zero raw video uploaded to remote servers, maximizing student privacy",
        "Eliminates need for exams",
        "Requires zero memory",
      ],
      correctOptionIndex: 1,
      marks: 2,
    },
    {
      questionText: "In ProctorVision, what does a high risk score indicate?",
      options: [
        "The student is automatically expelled",
        "The AI definitively declared misconduct",
        "Prioritization indicator requiring human teacher review of evidence frames",
        "Exam score is 0",
      ],
      correctOptionIndex: 2,
      marks: 2,
    },
  ]);

  const [csvNotice, setCsvNotice] = useState("");

  const downloadSampleCsv = () => {
    const csvContent =
      `Question,Option 1,Option 2,Option 3,Option 4,Correct Option (1-4),Marks\n` +
      `"What is the time complexity of binary search in a sorted array?","O(1)","O(log n)","O(n)","O(n log n)",2,2\n` +
      `"Which data structure follows the First-In-First-Out (FIFO) principle?","Stack","Queue","Priority Queue","Tree",2,2\n` +
      `"What is the default HTTP port for standard web traffic?","21","22","80","443",3,1\n` +
      `"Which hook in React is used for managing component local state?","useEffect","useContext","useState","useMemo",3,1\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "proctorvision_sample_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file must contain a header row and at least 1 question row.");
          return;
        }

        const parsedQuestions = [];
        // Skip header line 0
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Regex to parse comma-separated values respecting double quotes
          const matches = line.match(/(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^,]+)/g);
          if (!matches || matches.length < 6) continue;

          const cleanCols = matches.map((m) =>
            m.replace(/^"|"$/g, "").replace(/""/g, '"').trim()
          );

          const qText = cleanCols[0];
          const opt1 = cleanCols[1] || "";
          const opt2 = cleanCols[2] || "";
          const opt3 = cleanCols[3] || "";
          const opt4 = cleanCols[4] || "";
          const correctNum = parseInt(cleanCols[5], 10) || 1;
          const marks = parseInt(cleanCols[6], 10) || 1;

          if (qText && opt1 && opt2) {
            parsedQuestions.push({
              questionText: qText,
              options: [opt1, opt2, opt3, opt4].filter((o) => o.length > 0),
              correctOptionIndex: Math.max(0, Math.min(3, correctNum - 1)), // 1-indexed to 0-indexed
              marks: marks > 0 ? marks : 1,
            });
          }
        }

        if (parsedQuestions.length === 0) {
          alert("Could not parse any valid questions. Please ensure columns match the template.");
          return;
        }

        setQuestions(parsedQuestions);
        setCsvNotice(`🎉 Successfully loaded ${parsedQuestions.length} questions from CSV!`);
        setTimeout(() => setCsvNotice(""), 6000);
      } catch (err) {
        alert("Failed to parse CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset file input
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        marks: 2,
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      alert("Exam must have at least 1 question.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (publishImmediately = false) => {
    if (!title.trim()) {
      alert("Please provide an Exam Title.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        alert(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          alert(`Question #${i + 1}, Option #${j + 1} cannot be empty.`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      const res = await api.post("/exams", {
        title,
        description,
        instructions,
        durationMinutes: Number(durationMinutes),
        maxAttempts: Number(maxAttempts),
        questions,
        settings,
      });

      const examId = res.data.data._id;

      if (publishImmediately) {
        await api.post(`/exams/${examId}/publish`);
      }

      navigate("/teacher/exams");
    } catch (err) {
      alert("Failed to create exam: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/teacher/exams")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <CheckCircle className="h-4 w-4" />
            Save & Publish
          </button>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Exam Details & Configuration
        </h2>

        {/* Basic fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Exam Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS401: Cloud Computing & Systems Midterm"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Max Allowed Attempts
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Description & Syllabus
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the exam coverage..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Student Instructions
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Proctoring Settings Checklist */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <ShieldAlert className="h-4 w-4" />
            AI Proctoring Telemetry Options
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.faceMonitoring}
                onChange={(e) =>
                  setSettings({ ...settings, faceMonitoring: e.target.checked })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Face Centering
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.phoneDetection}
                onChange={(e) =>
                  setSettings({ ...settings, phoneDetection: e.target.checked })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Phone Detection
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.tabMonitoring}
                onChange={(e) =>
                  setSettings({ ...settings, tabMonitoring: e.target.checked })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Tab Switches
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.captureSnapshots}
                onChange={(e) =>
                  setSettings({ ...settings, captureSnapshots: e.target.checked })
                }
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Save Incident Snapshots
            </label>
          </div>
        </div>

        {/* Questions Section */}
        <div className="pt-4 border-t border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Exam Questions ({questions.length})
              </h3>
              <p className="text-xs text-slate-400">
                Add manually or upload via bulk CSV spreadsheet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                title="Download CSV Template"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                CSV Template
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>
          </div>

          {csvNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-medium animate-fade-in flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              {csvNotice}
            </div>
          )}

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-indigo-400">
                  Question #{qIndex + 1}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>Marks:</span>
                    <input
                      type="number"
                      min={1}
                      value={q.marks || 1}
                      onChange={(e) =>
                        updateQuestion(qIndex, "marks", Number(e.target.value))
                      }
                      className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Question text */}
              <input
                type="text"
                value={q.questionText}
                onChange={(e) =>
                  updateQuestion(qIndex, "questionText", e.target.value)
                }
                placeholder="Enter the question text here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />

              {/* Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">
                  Options (Select radio button for the correct answer key):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        q.correctOptionIndex === optIndex
                          ? "bg-emerald-950/30 border-emerald-700/60"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctOptionIndex === optIndex}
                        onChange={() =>
                          updateQuestion(qIndex, "correctOptionIndex", optIndex)
                        }
                        className="text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          updateOption(qIndex, optIndex, e.target.value)
                        }
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
