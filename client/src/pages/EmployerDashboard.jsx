import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Users, Eye, Plus, ChevronRight, Building, MessageSquare } from "lucide-react";
import { jobsAPI, chatAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Badge, Avatar, Spinner, EmptyState } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"];
const STATUS_COLORS = { 
  pending: "warning", 
  reviewing: "info", 
  shortlisted: "success", 
  interview: "info",
  accepted: "success", 
  rejected: "danger" 
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("jobs");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    Promise.all([jobsAPI.getEmployerJobs(), jobsAPI.getEmployerApplications()])
      .then(([j, a]) => { setJobs(j.data); setApplications(a.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (jobId, appId, status) => {
    setUpdating(appId);
    try {
      await jobsAPI.updateApplicationStatus(jobId, appId, status);
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
      toast.success(`Application marked as ${status}`);
    } catch { toast.error("Failed to update status"); } finally { setUpdating(null); }
  };

  const handleMessageApplicant = async (applicantId, jobId) => {
    if (!applicantId) {
      toast.error("Applicant information not available");
      return;
    }
    try {
      const response = await chatAPI.getOrCreate({ participantId: applicantId, jobId });
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

  const filteredApps = applications.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchJob = selectedJob === "all" || a.job?._id === selectedJob;
    return matchStatus && matchJob;
  });

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Briefcase, color: "#e94560" },
    { label: "Active Jobs", value: jobs.filter((j) => j.status === "active").length, icon: Eye, color: "#10b981" },
    { label: "Total Applicants", value: applications.length, icon: Users, color: "#3b82f6" },
    { label: "Hired", value: applications.filter((a) => a.status === "hired").length, icon: Building, color: "#f59e0b" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {user?.companyName || "Employer"} Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your job postings and applicants</p>
        </div>
        <Link to="/employer/post-job" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: "#e94560" }}>
          <Plus size={16} /> Post Job
        </Link>
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
        {[{ id: "jobs", label: "Job Posts" }, { id: "applications", label: "Applications" }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === id ? { background: "#e94560", color: "white" } : { color: "#94a3b8" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : tab === "jobs" ? (
        jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs posted yet" description="Post your first job and start finding talent."
            action={<Link to="/employer/post-job" className="px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#e94560" }}>Post a Job</Link>} />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="p-5 rounded-xl flex items-center gap-4" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{job.title}</h3>
                    <Badge variant={job.status === "active" ? "success" : "default"}>{job.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{job.location} · {job.jobType} · {job.applicants?.length || 0} applicants</p>
                  <p className="text-xs text-slate-500 mt-1">Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/employer/jobs/${job._id}/edit`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                    Edit
                  </Link>
                  <Link to={`/jobs/${job._id}`} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-white"
              style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}>
              <option value="all">All Jobs</option>
              {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <div className="flex gap-2 flex-wrap">
              {["all", ...STATUS_OPTIONS].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={statusFilter === s ? { background: "#e94560", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <EmptyState icon={Users} title="No applications" description="No applications match your filters." />
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div key={app._id} className="p-5 rounded-xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-4">
                    <Avatar src={app.applicant?.avatar} name={app.applicant?.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{app.applicant?.name}</h3>
                          <p className="text-sm text-slate-400">{app.applicant?.headline || app.applicant?.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Applied for <span className="text-slate-400">{app.job?.title}</span> · {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : 'Recently'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.applicant?.resume && (
                            <a href={app.applicant.resume} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                              Resume
                            </a>
                          )}
                          <button 
                            onClick={() => handleMessageApplicant(app.applicant._id, app.job?._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1" 
                            style={{ background: "rgba(255,255,255,0.05)" }}>
                            <MessageSquare size={12} /> Message
                          </button>
                          <select value={app.status} disabled={updating === app._id}
                            onChange={(e) => handleStatusUpdate(app.job?._id, app._id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: "rgba(233,69,96,0.15)", border: "none", color: "#e94560" }}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s} style={{ background: "#1e2a47" }}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      {app.applicant?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.applicant.skills.slice(0, 5).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
