import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, TrendingUp, Users, Briefcase, ArrowRight, Star, Zap } from "lucide-react";
import { jobsAPI } from "../lib/api";
import JobCard from "../components/jobs/JobCard";
import { Spinner } from "../components/ui";
import { motion } from "framer-motion";

const CATEGORIES = [
  { label: "Technology", icon: "💻", count: "2.4k+" },
  { label: "Marketing", icon: "📈", count: "1.2k+" },
  { label: "Design", icon: "🎨", count: "890+" },
  { label: "Finance", icon: "💰", count: "1.5k+" },
  { label: "Healthcare", icon: "🏥", count: "980+" },
  { label: "Education", icon: "📚", count: "670+" },
];

const STATS = [
  { label: "Jobs Posted", value: "50,000+", icon: Briefcase },
  { label: "Companies", value: "8,000+", icon: Users },
  { label: "Hired Monthly", value: "12,000+", icon: TrendingUp },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get featured jobs first, fallback to latest jobs if none are featured
    jobsAPI.getFeatured()
      .then((r) => {
        if (r.data && r.data.length > 0) {
          setFeaturedJobs(r.data);
        } else {
          // Fallback to latest jobs if no featured jobs
          return jobsAPI.getAll({ limit: 6, sort: '-createdAt' });
        }
      })
      .then((r) => {
        if (r && r.data) {
          setFeaturedJobs(r.data.jobs || r.data);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Advanced Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute rounded-full blur-3xl"
              style={{
                width: 200 + Math.random() * 300,
                height: 200 + Math.random() * 300,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 2 === 0 ? "#e94560" : "#533483",
              }}
            />
          ))}
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium cursor-default"
            style={{ background: "rgba(233,69,96,0.15)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560" }}
          >
            <Zap size={14} className="animate-pulse" /> 12,000+ people hired this month
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Find Your{" "}
            <span className="relative inline-block">
              <span style={{ color: "#e94560" }}>Dream Job</span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.2, duration: 1.2, ease: "circOut" }}
                className="absolute -bottom-2 left-0 h-1 rounded-full"
                style={{ background: "#e94560", opacity: 0.5 }}
              />
            </span>
            {" "}Today
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with top employers worldwide. Browse thousands of opportunities tailored to your skills and career goals.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto mb-8 p-2 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex-1 flex items-center gap-3 px-5 rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#e94560]/30" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Search size={20} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 py-4 text-white placeholder-slate-500 bg-transparent border-none focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-3 px-5 rounded-xl sm:w-60 transition-all focus-within:ring-2 focus-within:ring-[#e94560]/30" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.05)" }}>
              <MapPin size={20} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 py-4 text-white placeholder-slate-500 bg-transparent border-none focus:outline-none focus:ring-0"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#f52d50" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-10 py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-[#e94560]/20 text-lg"
              style={{ background: "#e94560" }}
            >
              Search Jobs
            </motion.button>
          </motion.form>

          <motion.p variants={itemVariants} className="text-sm text-slate-500 font-medium">
            Popular: <span className="text-slate-400">React Developer, Product Manager, Data Scientist, UI Designer</span>
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20" style={{ background: "#16213e" }}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {STATS.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="flex items-center gap-5 p-8 rounded-2xl group cursor-default"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg" style={{ background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.2)" }}>
                  <Icon size={28} style={{ color: "#e94560" }} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
                  <p className="text-sm text-slate-400 font-semibold tracking-wide uppercase">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Browse by Category
          </h2>
          <Link to="/jobs" className="flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5"
        >
          {CATEGORIES.map(({ label, icon, count }) => (
            <Link key={label} to={`/jobs?category=${label}`}>
              <motion.div
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  background: "rgba(233,69,96,0.05)",
                  borderColor: "rgba(233,69,96,0.3)",
                }}
                className="p-6 rounded-2xl text-center transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-3"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-4xl mb-2 filter drop-shadow-md">{icon}</span>
                <div>
                  <p className="text-sm font-bold text-white mb-1 leading-tight">{label}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">{count} jobs</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span style={{ color: "#e94560" }}>Featured</span> Jobs
          </h2>
          <Link to="/jobs" className="flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner /></div>
        ) : featuredJobs.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredJobs.map((job) => (
              <motion.div key={job._id} variants={itemVariants}>
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center py-24 rounded-3xl"
            style={{ background: "#1e2a47", border: "1px dashed rgba(255,255,255,0.1)" }}
          >
            <Briefcase size={60} className="mx-auto mb-6 text-slate-600" />
            <p className="text-xl font-medium text-slate-400 mb-6">No featured jobs available right now</p>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-[#e94560] font-bold hover:underline">
              Browse latest jobs <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-4"
      >
        <div className="max-w-5xl mx-auto rounded-3xl p-10 md:p-20 text-center relative overflow-hidden group shadow-2xl shadow-[#e94560]/10"
          style={{ background: "linear-gradient(135deg, #e94560, #16213e)" }}>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-full h-full rounded-full opacity-20 blur-3xl"
            style={{ background: "#533483" }}
          />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

          <div className="relative">
            <motion.h2
              whileInView={{ y: [20, 0], opacity: [0, 1] }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Are you hiring?
            </motion.h2>
            <p className="text-white/80 mb-8 text-lg">Post your job and reach thousands of qualified candidates today.</p>
            <Link to="/register?role=employer">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-white font-black px-12 py-5 rounded-2xl transition-all shadow-xl text-xl"
                style={{ color: "#e94560" }}
              >
                Get Started Now <ArrowRight size={22} strokeWidth={3} />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
