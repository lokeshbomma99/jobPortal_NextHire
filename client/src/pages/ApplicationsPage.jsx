import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, Eye, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { jobsAPI } from "../lib/api";
import { Badge, Spinner, EmptyState } from "../components/ui";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     variant: "warning", icon: Clock },
  reviewing:   { label: "Reviewing",   variant: "info",    icon: Eye },
  shortlisted: { label: "Shortlisted", variant: "success", icon: CheckCircle },
  interview:   { label: "Interview",   variant: "info",    icon: Eye },
  accepted:    { label: "Accepted 🎉", variant: "success", icon: CheckCircle },
  rejected:    { label: "Rejected",    variant: "danger",  icon: XCircle },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsAPI.getSeekerApplications()
      .then(({ data }) => setApplications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
        My Applications
      </h1>

      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start applying to jobs you're interested in."
          action={
            <Link to="/jobs" className="px-6 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#e94560" }}>
              Browse Jobs
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={app._id} className="p-5 rounded-xl flex items-center gap-4"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${app.job?._id}`}>
                    <h3 className="font-semibold text-white hover:text-red-400 transition-colors truncate">
                      {app.job?.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-400">{app.job?.companyName} · {app.job?.location}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Applied {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : 'recently'}
                  </p>
                </div>
                <Badge variant={cfg.variant}>
                  <StatusIcon size={11} className="mr-1" />
                  {cfg.label}
                </Badge>
                <Link to={`/jobs/${app.job?._id}`} className="text-slate-500 hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}