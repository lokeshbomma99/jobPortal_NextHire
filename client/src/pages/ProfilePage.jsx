import { useState, useRef } from "react";
import { Camera, Upload, Plus, X, Save, Lock } from "lucide-react";
import { authAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/ui";
import toast from "react-hot-toast";

const SKILLS_SUGGESTIONS = [
  "React", "Node.js", "Python", "TypeScript", "AWS",
  "Docker", "MongoDB", "PostgreSQL", "GraphQL", "Next.js",
];

// ✅ FIXED: InputField moved OUTSIDE ProfilePage — prevents remount on every render (focus loss bug)
const InputField = ({ label, name, type = "text", placeholder, form, setForm }) => (
  <div>
    <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
    <input
      type={type}
      value={form[name] || ""}
      onChange={(e) => setForm(prev => ({ ...prev, [name]: e.target.value }))}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
    />
  </div>
);

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
    website: user?.website || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    skills: user?.skills || [],
    companyName: user?.companyName || "",
    companyDescription: user?.companyDescription || "",
    companyWebsite: user?.companyWebsite || "",
    industry: user?.industry || "",
    companySize: user?.companySize || "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [tab, setTab] = useState("personal");
  const avatarRef = useRef();
  const resumeRef = useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    setUploadingAvatar(true);
    try {
      await authAPI.uploadAvatar(fd);
      await refreshUser();
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);
    setUploadingResume(true);
    try {
      await authAPI.uploadResume(fd);
      await refreshUser();
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const addSkill = (skill) => {
    const s = skill || skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, s] }));
      setSkillInput("");
    }
  };

  const handleChangePw = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (pwForm.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal" },
    ...(user?.role === "employer" ? [{ id: "company", label: "Company" }] : []),
    { id: "security", label: "Security" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
        Your Profile
      </h1>

      {/* Avatar Section */}
      <div className="p-6 rounded-2xl mb-6 flex items-center gap-6"
        style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative">
          <Avatar src={user?.avatar} name={user?.name} size="xl" />
          <button
            onClick={() => avatarRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ background: "#e94560" }}
          >
            {uploadingAvatar
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera size={12} />}
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{user?.name}</h2>
          <p className="text-sm text-slate-400 capitalize">{user?.role} · {user?.email}</p>
          {user?.role === "seeker" && (
            <div className="mt-3">
              <button
                onClick={() => resumeRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{ background: "rgba(233,69,96,0.15)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560" }}
              >
                {uploadingResume
                  ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <Upload size={14} />}
                {user?.resume ? "Update Resume" : "Upload Resume"}
              </button>
              {user?.resumeName && <p className="text-xs text-slate-500 mt-1">📎 {user.resumeName}</p>}
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "#1e2a47" }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === id ? { background: "#e94560", color: "white" } : { color: "#94a3b8" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Personal Tab */}
      {tab === "personal" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-semibold text-white mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* ✅ Now passing form and setForm as props */}
              <InputField label="Full Name" name="name" placeholder="John Doe" form={form} setForm={setForm} />
              <InputField label="Location" name="location" placeholder="San Francisco, CA" form={form} setForm={setForm} />
              {user?.role === "seeker" && <InputField label="Headline" name="headline" placeholder="Senior React Developer" form={form} setForm={setForm} />}
              <InputField label="Phone" name="phone" placeholder="+1 234 567 8900" form={form} setForm={setForm} />
              <InputField label="Website" name="website" placeholder="https://yoursite.com" form={form} setForm={setForm} />
              <InputField label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/username" form={form} setForm={setForm} />
              {user?.role === "seeker" && <InputField label="GitHub" name="github" placeholder="github.com/username" form={form} setForm={setForm} />}
            </div>
            {user?.role === "seeker" && (
              <div className="mt-5">
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell employers about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
            )}
          </div>

          {user?.role === "seeker" && (
            <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="font-semibold text-white mb-4">Skills</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button onClick={() => addSkill()} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: "#e94560" }}>
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                    style={{ background: "rgba(233,69,96,0.15)", border: "1px solid rgba(233,69,96,0.3)", color: "#e94560" }}>
                    {s}
                    <button onClick={() => setForm(prev => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }))} className="hover:text-red-300">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILLS_SUGGESTIONS.filter((s) => !form.skills.includes(s)).slice(0, 6).map((s) => (
                  <button key={s} onClick={() => addSkill(s)}
                    className="px-3 py-1 rounded-full text-xs transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#e94560" }}>
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {tab === "company" && user?.role === "employer" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-semibold text-white mb-4">Company Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Company Name" name="companyName" placeholder="Acme Inc." form={form} setForm={setForm} />
              <InputField label="Industry" name="industry" placeholder="Technology" form={form} setForm={setForm} />
              <InputField label="Company Website" name="companyWebsite" placeholder="https://company.com" form={form} setForm={setForm} />
              <InputField label="Company Size" name="companySize" placeholder="50-200 employees" form={form} setForm={setForm} />
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Company Description</label>
              <textarea
                value={form.companyDescription}
                onChange={(e) => setForm(prev => ({ ...prev, companyDescription: e.target.value }))}
                placeholder="Describe your company, culture, and mission..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#e94560" }}>
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white mb-5">Change Password</h3>
          <div className="space-y-4 max-w-md">
            {[
              { label: "Current Password", name: "currentPassword" },
              { label: "New Password", name: "newPassword" },
              { label: "Confirm New Password", name: "confirmPassword" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
                <input
                  type="password"
                  value={pwForm[name]}
                  onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
            ))}
            <button onClick={handleChangePw} disabled={changingPw}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: "#e94560" }}>
              {changingPw ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={15} />}
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}