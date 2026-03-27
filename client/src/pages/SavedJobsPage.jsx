import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MapPin, Clock } from "lucide-react";
import { jobsAPI } from "../lib/api";
import { Avatar, Badge, Spinner, EmptyState } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsAPI.getSaved()
      .then(({ data }) => setSavedJobs(data))
      .catch(() => toast.error("Failed to load saved jobs"))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (id) => {
    try {
      await jobsAPI.toggleSave(id);
      setSavedJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success("Job removed from saved");
    } catch {
      toast.error("Failed to unsave job");
    }
  };

  const typeColors = {
    "full-time": "success", "part-time": "info",
    contract: "warning", internship: "purple", freelance: "primary",
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
        Saved Jobs
        {savedJobs.length > 0 && (
          <span className="ml-3 text-base font-normal text-slate-400">({savedJobs.length})</span>
        )}
      </h1>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Bookmark jobs you're interested in to revisit them later."
          action={
            <Link to="/jobs" className="px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#e94560" }}>
              Browse Jobs
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <div key={job._id} className="p-5 rounded-xl transition-all hover:border-red-500/20"
              style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-3 mb-3">
                <Avatar src={job.companyLogo} name={job.companyName} size="md" />
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job._id}`}>
                    <h3 className="font-semibold text-white hover:text-red-400 transition-colors truncate">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 truncate">{job.companyName}</p>
                </div>
                <button onClick={() => handleUnsave(job._id)} className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0" title="Remove">
                  <Bookmark size={16} className="fill-current" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant={typeColors[job.type] || "default"}>{job.type}</Badge>
                {job.locationType && <Badge variant="info">{job.locationType}</Badge>}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                <span className="flex items-center gap-1 ml-auto">
                  <Clock size={11} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}