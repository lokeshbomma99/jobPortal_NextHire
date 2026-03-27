import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Bookmark, Clock, CheckCircle, XCircle, Search, Eye, ChevronRight, MessageSquare } from "lucide-react";
import { jobsAPI, chatAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Badge, Avatar, Spinner, EmptyState } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  reviewing: { label: "Reviewing", variant: "info", icon: Eye },
  shortlisted: { label: "Shortlisted", variant: "success", icon: CheckCircle },
  interview: { label: "Interview", variant: "info", icon: Eye },
  accepted: { label: "Accepted 🎉", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "danger", icon: XCircle },
};

export default function SeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("applications");

  useEffect(() => {
    Promise.all([jobsAPI.getSeekerApplications(), jobsAPI.getSaved()])
      .then(([a, s]) => { setApplications(a.data); setSavedJobs(s.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMessageEmployer = async (employerId, jobId) => {
    if (!employerId) {
      toast.error("Employer information not available");
      return;
    }
    try {
      const response = await chatAPI.getOrCreate({ participantId: employerId, jobId });
      const conversation = response.data;
      if (conversation && conversation._id) {
        navigate(`/chat/${conversation._id}`);
      } else {
        console.error("Invalid conversation response:", response);
        toast.error("Failed to create conversation");
      }
    } catch (err) { 
      console.error("Chat error:", err);
      toast.error("Failed to open chat"); 
    }
  };

  const stats = [
    { label: "Total Applied", value: applications.length, icon: Briefcase, color: "#e94560" },
    { label: "Shortlisted", value: applications.filter((a) => a.status === "shortlisted").length, icon: CheckCircle, color: "#10b981" },
    { label: "Pending", value: applications.filter((a) => a.status === "pending").length, icon: Clock, color: "#f59e0b" },
    { label: "Saved Jobs", value: savedJobs.length, icon: Bookmark, color: "#3b82f6" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar src={user?.avatar} name={user?.name} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Hello, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-400">{user?.headline || "Complete your profile to stand out"}</p>
        </div>
        <div className="ml-auto hidden sm:block">
          <Link to="/jobs" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90" style={{ background: "#e94560" }}>
            <Search size={15} /> Browse Jobs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "#1e2a47" }}>
        {[
          { id: "applications", label: "My Applications", count: applications.length },
          { id: "saved", label: "Saved Jobs", count: savedJobs.length },
        ].map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === id ? { background: "#e94560", color: "white" } : { color: "#94a3b8" }}>
            {label} {count > 0 && <span className="ml-1.5 text-xs opacity-75">({count})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : tab === "applications" ? (
        applications.length === 0 ? (
          <EmptyState icon={Briefcase} title="No applications yet" description="Start applying to jobs you're interested in."
            action={<Link to="/jobs" className="px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#e94560" }}>Browse Jobs</Link>} />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              return (
                <div key={app._id} className="p-5 rounded-xl flex items-center gap-4" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${app.job?._id}`}>
                      <h3 className="font-semibold text-white hover:text-red-400 transition-colors truncate">{app.job?.title}</h3>
                    </Link>
                    <p className="text-sm text-slate-400">{app.job?.companyName} · {app.job?.location}</p>
                    <p className="text-xs text-slate-500 mt-1">Applied {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : 'recently'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleMessageEmployer(app.employer?._id || app.employer, app.job?._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1" 
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <MessageSquare size={12} /> Message
                    </button>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <Link to={`/jobs/${app.job?._id}`} className="text-slate-500 hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        )
      ) : (
        savedJobs.length === 0 ? (
          <EmptyState icon={Bookmark} title="No saved jobs" description="Save jobs to revisit them later."
            action={<Link to="/jobs" className="px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#e94560" }}>Browse Jobs</Link>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map((job) => (
              <Link key={job._id} to={`/jobs/${job._id}`}>
                <div className="p-4 rounded-xl transition-all hover:border-red-500/30" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar src={job.companyLogo} name={job.companyName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                      <p className="text-xs text-slate-400 truncate">{job.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{job.location}</span>
                    <span>·</span>
                    <span className="capitalize">{job.jobType}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
