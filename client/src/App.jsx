import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/common/PageWrapper";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SeekerDashboard from "./pages/SeekerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJobPage from "./pages/PostJobPage";
import EditJobPage from "./pages/EditJobPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminPage from "./pages/AdminPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import LoadingSpinner from "./components/common/LoadingSpinner";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to={user.role === "employer" ? "/employer/dashboard" : "/seeker/dashboard"} replace />;
  return children;
};

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="jobs" element={<PageWrapper><JobsPage /></PageWrapper>} />
          <Route path="jobs/:id" element={<PageWrapper><JobDetailPage /></PageWrapper>} />

          <Route path="login" element={<GuestRoute><PageWrapper><LoginPage /></PageWrapper></GuestRoute>} />
          <Route path="register" element={<GuestRoute><PageWrapper><RegisterPage /></PageWrapper></GuestRoute>} />

          <Route path="profile" element={<PrivateRoute><PageWrapper><ProfilePage /></PageWrapper></PrivateRoute>} />
          <Route path="notifications" element={<PrivateRoute><PageWrapper><NotificationsPage /></PageWrapper></PrivateRoute>} />
          <Route path="chat" element={<PrivateRoute><PageWrapper><ChatPage /></PageWrapper></PrivateRoute>} />
          <Route path="chat/:conversationId" element={<PrivateRoute><PageWrapper><ChatPage /></PageWrapper></PrivateRoute>} />

          <Route path="seeker/dashboard" element={<PrivateRoute roles={["seeker"]}><PageWrapper><SeekerDashboard /></PageWrapper></PrivateRoute>} />
          <Route path="seeker/applications" element={<PrivateRoute roles={["seeker"]}><PageWrapper><ApplicationsPage /></PageWrapper></PrivateRoute>} />
          <Route path="seeker/saved" element={<PrivateRoute roles={["seeker"]}><PageWrapper><SavedJobsPage /></PageWrapper></PrivateRoute>} />

          <Route path="employer/dashboard" element={<PrivateRoute roles={["employer"]}><PageWrapper><EmployerDashboard /></PageWrapper></PrivateRoute>} />
          <Route path="employer/post-job" element={<PrivateRoute roles={["employer"]}><PageWrapper><PostJobPage /></PageWrapper></PrivateRoute>} />
          <Route path="employer/jobs/:id/edit" element={<PrivateRoute roles={["employer"]}><PageWrapper><EditJobPage /></PageWrapper></PrivateRoute>} />
          <Route path="employer/jobs/:id/applications" element={<PrivateRoute roles={["employer"]}><PageWrapper><ApplicationsPage /></PageWrapper></PrivateRoute>} />

          <Route path="admin" element={<PrivateRoute roles={["admin"]}><PageWrapper><AdminPage /></PageWrapper></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
