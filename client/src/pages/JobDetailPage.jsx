import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Share2, Building, Users, Globe, Send, X } from "lucide-react";
import { jobsAPI, chatAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Spinner, Avatar } from "../components/ui";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "warning",
  reviewing: "info",
  shortlisted: "success",
  interview: "info",
  accepted: "success",
  rejected: "danger",
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [userApplication, setUserApplication] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await jobsAPI.getById(id);
        setJob(data);
        if (user) {
          const app = data.applications?.find((a) => a.applicant === user._id || a.applicant?._id === user._id);
          setUserApplication(app || null);

          const saved = await jobsAPI.getSaved();
          setSaved(saved.data.some((j) => j._id === id));
        }
      } catch {
        toast.error("Job not found");
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { navigate("/login?redirect=" + encodeURIComponent(`/jobs/${id}`)); return; }
    if (user.role === "employer") { toast.error("Employers cannot apply for jobs"); return; }
    setApplying(true);
    try {
      await jobsAPI.apply(id, { coverLetter });
      toast.success("Application submitted!");
      setShowApplyModal(false);
      const { data } = await jobsAPI.getById(id);
      setJob(data);
      const app = data.applications?.find((a) => a.applicant === user._id || a.applicant?._id === user._id);
      setUserApplication(app);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error("Please login to save jobs"); return; }
    try {
      const { data } = await jobsAPI.toggleSave(id);
      setSaved(data.saved);
      toast.success(data.message);
    } catch { toast.error("Failed to save job"); }
  };

  const handleMessage = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const response = await chatAPI.getOrCreate({ participantId: job.employer._id, jobId: id });
      const conversation = response.data;
      if (conversation && conversation._id) {
        navigate(`/chat/${conversation._id}`);
      } else {
        toast.error("Failed to create conversation");
      }
    } catch (err) { 
      console.error("Chat error:", err);
      toast.error("Failed to open chat"); 
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-96"><Spinner size="lg" /></div>;
  if (!job) return null;

  const typeColors = { "full-time": "success", "part-time": "info", contract: "warning", internship: "purple", freelance: "primary" };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-start gap-4 mb-4">
              <Avatar src={job.companyLogo} name={job.companyName} size="lg" />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {job.title}
                </h1>
                <p className="text-slate-400">{job.companyName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant={typeColors[job.jobType] || "default"}>{job.jobType}</Badge>
              <Badge variant="info">{job.isRemote ? 'Remote' : job.location}</Badge>
              <Badge variant="default">{job.experienceLevel} level</Badge>
              {job.featured && <Badge variant="warning">⚡ Featured</Badge>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {[
                { icon: MapPin, label: "Location", value: job.location },
                { icon: Clock, label: "Posted", value: formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) },
                { icon: Users, label: "Applications", value: job.applicants?.length || 0 },
                { icon: DollarSign, label: "Salary", value: job.salaryMin && job.salaryMax ? `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax / 1000).toFixed(0)}k/${job.salaryPeriod}` : "Not disclosed" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <Icon size={13} className="text-red-400" /> {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Apply Actions */}
            {userApplication ? (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">You've applied to this job</p>
                  <p className="text-xs text-slate-400">Applied {userApplication.createdAt ? formatDistanceToNow(new Date(userApplication.createdAt), { addSuffix: true }) : 'recently'}</p>
                </div>
                <Badge variant={STATUS_COLORS[userApplication.status]}>{userApplication.status}</Badge>
              </div>
            ) : (
              <div className="flex gap-3">
                {user?.role !== "employer" && user?.role !== "admin" && (
                  <button
                    onClick={() => user ? setShowApplyModal(true) : navigate("/login?redirect=/jobs/" + id)}
                    className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: "#e94560" }}
                  >
                    <Send size={16} /> Apply Now
                  </button>
                )}
                {user?.role !== "admin" && (
                  <button onClick={handleSave} className="p-3 rounded-xl transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {saved ? <BookmarkCheck size={20} className="text-red-400" /> : <Bookmark size={20} className="text-slate-400" />}
                  </button>
                )}
                {user && user._id !== job.employer?._id && user.role !== "admin" && (
                  <button onClick={handleMessage} className="p-3 rounded-xl transition-all text-slate-400 hover:text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Share2 size={20} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl space-y-6" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Section title="Job Description">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </Section>

            {job.responsibilities?.length > 0 && (
              <Section title="Responsibilities">
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#e94560" }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.requirements?.length > 0 && (
              <Section title="Requirements">
                <ul className="space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#e94560" }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.skills?.length > 0 && (
              <Section title="Required Skills">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(233,69,96,0.15)", color: "#e94560" }}>{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {job.benefits?.length > 0 && (
              <Section title="Benefits">
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <span key={b} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>✓ {b}</span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Company Info */}
          <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-semibold text-white mb-4">About the Company</h3>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={job.employer?.companyLogo || job.companyLogo} name={job.companyName} size="lg" />
              <div>
                <p className="font-medium text-white">{job.companyName}</p>
                {job.employer?.industry && <p className="text-xs text-slate-400">{job.employer.industry}</p>}
              </div>
            </div>
            {job.employer?.companyDescription && (
              <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">{job.employer.companyDescription}</p>
            )}
            {job.employer?.companyWebsite && (
              <a href={job.employer.companyWebsite} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                <Globe size={12} /> Visit website
              </a>
            )}
          </div>

          {/* Job Overview */}
          <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-semibold text-white mb-4">Job Overview</h3>
            <dl className="space-y-3 text-sm">
              {[
                ["Category", job.industry],
                ["Job Type", job.jobType],
                ["Experience", job.experienceLevel + " level"],
                ["Work Mode", job.isRemote ? "Remote" : "On-site"],
                ["Deadline", job.deadline ? format(new Date(job.deadline), "MMM d, yyyy") : "Open"],
                ["Views", job.views],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-slate-300 capitalize">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Apply for {job.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            {user?.resume ? (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="text-emerald-400 text-sm">✓</span>
                <div>
                  <p className="text-sm font-medium text-emerald-400">Resume ready</p>
                  <p className="text-xs text-slate-400">{user.resumeName || "Your resume will be attached"}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl mb-4" style={{ background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.2)" }}>
                <p className="text-sm text-red-400">No resume uploaded. <Link to="/profile" className="underline">Add resume →</Link></p>
              </div>
            )}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
                Cancel
              </button>
              <button onClick={handleApply} disabled={applying} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#e94560" }}>
                {applying ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div>
    <h2 className="font-semibold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h2>
    {children}
  </div>
);
