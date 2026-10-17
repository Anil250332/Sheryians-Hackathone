import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";

// Pages
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";

// Teacher Pages
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard.jsx";
import { TeacherExams } from "./pages/teacher/TeacherExams.jsx";
import { CreateExam } from "./pages/teacher/CreateExam.jsx";
import { AttemptsList } from "./pages/teacher/AttemptsList.jsx";
import { ReviewQueue } from "./pages/teacher/ReviewQueue.jsx";
import { MonitoringSettings } from "./pages/teacher/MonitoringSettings.jsx";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard.jsx";
import { ExamInstructions } from "./pages/student/ExamInstructions.jsx";
import { ExamConsent } from "./pages/student/ExamConsent.jsx";
import { ExamRoom } from "./pages/student/ExamRoom.jsx";
import { ExamResult } from "./pages/student/ExamResult.jsx";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex flex-1 min-h-screen items-start">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Teacher Protected */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <DashboardLayout>
                    <TeacherDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/exams"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <DashboardLayout>
                    <TeacherExams />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/exams/create"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <DashboardLayout>
                    <CreateExam />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attempts"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <DashboardLayout>
                    <AttemptsList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/reviews"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <DashboardLayout>
                    <ReviewQueue />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/settings"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                  <DashboardLayout>
                    <MonitoringSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Protected */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <StudentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/results"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <ExamResult />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exams/:id/instructions"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamInstructions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exams/:id/consent"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamConsent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attempts/:id"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamRoom />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
