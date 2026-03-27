import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, MapPin, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { jobsAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/jobs/JobCard";
import { Spinner, EmptyState } from "../components/ui";
import toast from "react-hot-toast";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "lead", "executive"];
const LOCATION_TYPES = ["remote", "onsite", "hybrid"];
const CATEGORIES = ["Technology", "Marketing", "Design", "Finance", "Healthcare", "Education", "Sales", "Engineering", "HR", "Legal"];

export default function JobsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    experience: searchParams.get("experience") || "",
    locationType: searchParams.get("locationType") || "",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await jobsAPI.getAll(params);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      toast.error("Failed to load jobs");
      setJobs([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (!user) return;
    jobsAPI.getSaved()
      .then(({ data }) => setSavedJobs(new Set((data || []).map((j) => j._id))))
      .catch(() => {});
  }, [user]);

  const handleFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === val ? "" : val }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleSave = async (id) => {
    if (!user) { toast.error("Please login to save jobs"); return; }
    try {
      const { data } = await jobsAPI.toggleSave(id);
      setSavedJobs((prev) => {
        const next = new Set(prev);
        data.saved ? next.add(id) : next.delete(id);
        return next;
      });
      toast.success(data.message);
    } catch { toast.error("Failed to save job"); }
  };

  const clearFilters = () => {
    setFilters({ search: "", location: "", type: "", category: "", experience: "", locationType: "" });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          {total > 0 ? `${total.toLocaleString()} Jobs Found` : "Browse Jobs"}
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 rounded-xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              className="flex-1 py-3 text-sm text-white placeholder-slate-500 bg-transparent border-none focus:outline-none"
              style={{ border: "none", boxShadow: "none" }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 rounded-xl sm:w-48" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MapPin size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
              className="flex-1 py-3 text-sm text-white placeholder-slate-500 bg-transparent border-none focus:outline-none"
              style={{ border: "none", boxShadow: "none" }}
            />
          </div>
          <button type="submit" className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: "#e94560" }}>
            Search
          </button>
          <button type="button" onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: filtersOpen ? "#e94560" : "#1e2a47", color: filtersOpen ? "white" : "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
            <SlidersHorizontal size={16} />
            Filters {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full text-xs bg-white text-red-500 font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </form>
      </div>

      {/* Expanded Filters */}
      {filtersOpen && (
        <div className="mb-6 p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Job Type */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Type</p>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((t) => (
                  <button key={t} onClick={() => handleFilter("type", t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                    style={filters.type === t ? { background: "#e94560", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Type */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Mode</p>
              <div className="flex flex-wrap gap-2">
                {LOCATION_TYPES.map((t) => (
                  <button key={t} onClick={() => handleFilter("locationType", t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                    style={filters.locationType === t ? { background: "#e94560", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience</p>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((e) => (
                  <button key={e} onClick={() => handleFilter("experience", e)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                    style={filters.experience === e ? { background: "#e94560", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
              <select value={filters.category} onChange={(e) => handleFilter("category", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Search} title="No jobs found" description="Try adjusting your search or filters." action={
          <button onClick={clearFilters} className="px-6 py-2 rounded-lg font-medium text-white text-sm" style={{ background: "#e94560" }}>
            Clear Filters
          </button>
        } />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} saved={savedJobs.has(job._id)} onSave={handleSave} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                Previous
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > pages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                    style={p === page ? { background: "#e94560", color: "white" } : { background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
