import { useState, useEffect } from "react";
import { Avatar, Badge, Spinner } from "../components/ui";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, Calendar, Building, Globe, FileText, ExternalLink, Users, Briefcase, TrendingUp, Activity, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { adminAPI } from "../lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data.users);
      })
      .catch((err) => {
        console.error("Failed to load admin data:", err);
        toast.error("Failed to load admin data");
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = async (role) => {
    try {
      const { data } = await adminAPI.getUsers({ role });
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users");
    }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUserStatus(id);
      setUsers((p) => p.map((u) => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(`User ${data.isActive ? "activated" : "deactivated"}`);
    } catch { toast.error("Failed to update user"); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers((p) => p.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "#e94560" },
    { label: "Total Jobs", value: stats.totalJobs || 0, icon: Briefcase, color: "#10b981" },
    { label: "Applications", value: stats.totalApplications || 0, icon: TrendingUp, color: "#3b82f6" },
    { label: "Active Jobs", value: stats.activeJobs || 0, icon: Activity, color: "#f59e0b" },
  ] : [];

  const handleUserClick = async (user) => {
    setDetailsLoading(true);
    try {
      const { data } = await adminAPI.getUserDetails(user._id);
      setSelectedUser(data);
    } catch (err) {
      toast.error("Failed to load user details");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8"
    >
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>Admin Dashboard</h1>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{value?.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Manage Users</h2>
              <div className="flex gap-2">
                {["", "seeker", "employer", "admin"].map((r) => (
                  <button key={r} onClick={() => { setRoleFilter(r); fetchUsers(r); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                    style={roleFilter === r ? { background: "#e94560", color: "white" } : { background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                    {r || "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {users.map((u, i) => (
                  <motion.div
                    key={u?._id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                    onClick={() => u && handleUserClick(u)}
                  >
                    <Avatar src={u?.avatar} name={u?.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate group-hover:text-[#e94560] transition-colors">{u?.name}</p>
                        <Badge variant={u?.role === "admin" ? "primary" : u?.role === "employer" ? "info" : "default"}>{u?.role}</Badge>
                        {u && !u.isActive && <Badge variant="danger">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{u?.email}</p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => u?._id && toggleUser(u._id)} className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors">
                        {u?.isActive ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => u?._id && deleteUser(u._id)} className="p-2 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "#16213e", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-r from-[#e94560] to-[#f52d50]">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute -bottom-12 left-8">
                  <div className="p-1 rounded-2xl bg-[#16213e]">
                    <Avatar src={selectedUser?.user?.avatar} name={selectedUser?.user?.name} size="xl" className="rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedUser?.user?.name}</h2>
                    <p className="text-slate-400 flex items-center gap-1 mt-1">
                      <Badge variant={selectedUser?.user?.role === "admin" ? "primary" : selectedUser?.user?.role === "employer" ? "info" : "default"}>
                        {selectedUser?.user?.role}
                      </Badge>
                      <span className="mx-2">•</span>
                      Joined {selectedUser?.user?.createdAt ? new Date(selectedUser.user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {!selectedUser?.user?.isActive && <Badge variant="danger">Disabled</Badge>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Mail size={18} className="text-[#e94560]" />
                      <span className="text-sm">{selectedUser?.user?.email}</span>
                    </div>
                    {selectedUser?.user?.phone && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Phone size={18} className="text-[#e94560]" />
                        <span className="text-sm">{selectedUser?.user?.phone}</span>
                      </div>
                    )}
                    {selectedUser?.user?.location && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <MapPin size={18} className="text-[#e94560]" />
                        <span className="text-sm">{selectedUser?.user?.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {selectedUser?.user?.bio && (
                      <div className="text-sm text-slate-400 italic">
                        "{selectedUser.user.bio}"
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-white/5 mb-8" />

                {/* Role Specific Content */}
                {selectedUser?.user?.role === "employer" ? (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Building size={20} className="text-[#e94560]" />
                      Company Details & Jobs ({selectedUser?.totalJobs || 0})
                    </h3>
                    <div className="p-4 rounded-xl bg-white/5 mb-6 border border-white/5">
                      <div className="flex items-center gap-4 mb-4">
                        {selectedUser?.user?.companyLogo && (
                          <img src={selectedUser.user.companyLogo} alt="" className="w-12 h-12 rounded-lg object-contain bg-white p-1" />
                        )}
                        <div>
                          <p className="font-bold text-white">{selectedUser?.user?.companyName || "N/A"}</p>
                          <p className="text-xs text-slate-400">{selectedUser?.user?.industry || "Industry Not Specified"}</p>
                        </div>
                      </div>
                      {selectedUser?.user?.companyWebsite && (
                        <a href={selectedUser.user.companyWebsite} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#e94560] hover:underline flex items-center gap-1">
                          <Globe size={12} /> {selectedUser.user.companyWebsite}
                        </a>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedUser.jobs?.map(job => (
                        <div key={job._id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                          <div>
                            <p className="text-sm font-medium text-white">{job.title}</p>
                            <p className="text-xs text-slate-500">{new Date(job.createdAt).toLocaleDateString()} • {job.applicants.length} Applicants</p>
                          </div>
                          <Badge variant={job.status === "active" ? "success" : "default"}>{job.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-[#e94560]" />
                      Professional Profile & Applications ({selectedUser?.totalApplications || 0})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser?.user?.skills?.length > 0 ? selectedUser.user.skills.map(s => (
                            <span key={s} className="px-2 py-1 rounded-md bg-[#e94560]/10 text-[#e94560] text-[10px] font-medium uppercase">{s}</span>
                          )) : <span className="text-xs text-slate-500">None added</span>}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Resume</p>
                        {selectedUser?.user?.resume ? (
                          <a href={selectedUser.user.resume} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[#e94560] hover:underline">
                            <FileText size={16} /> {selectedUser.user.resumeOriginalName || "View Resume"}
                          </a>
                        ) : <span className="text-xs text-slate-500">No resume uploaded</span>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 uppercase font-bold px-1">Recent Applications</p>
                      {selectedUser.applications?.map(app => (
                        <div key={app._id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                          <div>
                            <p className="text-sm font-medium text-white">{app.job?.title || "Unknown Job"}</p>
                            <p className="text-xs text-slate-500">{app.job?.companyName} • {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={app.status === "accepted" ? "success" : app.status === "rejected" ? "danger" : "info"}>
                            {app.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
