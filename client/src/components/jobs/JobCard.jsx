import { Link } from "react-router-dom";
import { MapPin, Clock, Bookmark, BookmarkCheck, DollarSign, Zap } from "lucide-react";
import { Badge, Avatar } from "../ui";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const typeColors = {
  "full-time": "success",
  "part-time": "info",
  contract: "warning",
  internship: "purple",
  freelance: "primary",
};

const experienceLabels = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
};

export default function JobCard({ job, saved = false, onSave, compact = false }) {
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(job._id);
  };

  return (
    <Link to={`/jobs/${job._id}`}>
      <motion.div
        whileHover={{
          y: -4,
          scale: 1.01,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
          borderColor: "rgba(233, 69, 96, 0.4)"
        }}
        whileTap={{ scale: 0.98 }}
        className="group p-5 rounded-xl transition-colors duration-200"
        style={{
          background: "#1e2a47",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar src={job.companyLogo || job.employer?.companyLogo} name={job.companyName || job.employer?.companyName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1 group-hover:text-[#e94560] transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{job.companyName || job.employer?.companyName}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {job.featured && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-amber-400"
                  >
                    <Zap size={14} />
                  </motion.span>
                )}
                {onSave && (
                  <button onClick={handleSave} className="p-1 rounded text-slate-500 hover:text-[#e94560] transition-colors">
                    {saved ? <BookmarkCheck size={16} className="text-[#e94560]" /> : <Bookmark size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant={typeColors[job.jobType] || "default"}>{job.jobType}</Badge>
          {job.experienceLevel && <Badge variant="default">{experienceLabels[job.experienceLevel] || job.experienceLevel}</Badge>}
          {job.isRemote && <Badge variant="info">Remote</Badge>}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {job.location}
          </span>
          {job.salaryMin > 0 && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <DollarSign size={11} />
              {(job.salaryMin / 1000).toFixed(0)}k{job.salaryMax > 0 ? `–${(job.salaryMax / 1000).toFixed(0)}k` : '+'}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={11} />
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
        </div>

        {!compact && job.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
