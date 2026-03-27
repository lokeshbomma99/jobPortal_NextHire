import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Building, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ThreeDModel from "../components/common/ThreeDModel";


const Field = ({
  icon: Icon,
  label,
  name,
  type = "text",
  placeholder,
  error,
  value,
  onChange,
  extra,
}) => (
  <div>
    <label className="text-sm font-medium text-slate-300 block mb-1.5">
      {label}
    </label>

    <div className="relative">
      <Icon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${error ? "#e94560" : "rgba(255,255,255,0.1)"
            }`,
        }}
      />

      {extra}
    </div>

    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);



export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker", // Default role
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});



  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = form.role === "employer" ? "Company name is required" : "Name is required";
    }

    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";

    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match";

    setErrors(e);

    return Object.keys(e).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const data = await register(form); // Pass the entire form object

      toast.success(`Welcome to JobPortal, ${data.user.name}!`);

      navigate(
        form.role === "employer"
          ? "/employer/dashboard"
          : "/seeker/dashboard",
        { replace: true }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#e94560" }}>
            <Briefcase size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Create account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join our platform today</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, role: "seeker" }))}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                style={form.role === "seeker" ? { background: "rgba(233,69,96,0.1)", borderColor: "#e94560", color: "#e94560" } : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
              >
                <UserCircle size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, role: "employer" }))}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                style={form.role === "employer" ? { background: "rgba(233,69,96,0.1)", borderColor: "#e94560", color: "#e94560" } : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
              >
                <Building size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Employer</span>
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">{form.role === "employer" ? "Company Name" : "Full Name"}</label>
              <div className="relative">
                {form.role === "employer" ? <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /> : <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={form.role === "employer" ? "Tech Corp" : "John Doe"}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.name ? "#e94560" : "rgba(255,255,255,0.1)"}` }}
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.email ? "#e94560" : "rgba(255,255,255,0.1)"}` }}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.password ? "#e94560" : "rgba(255,255,255,0.1)"}` }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={showPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-slate-500"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${errors.confirmPassword
                      ? "#e94560"
                      : "rgba(255,255,255,0.1)"
                      }`,
                  }}
                />
              </div>

              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
              style={{ background: "#e94560" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold" style={{ color: "#e94560" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}