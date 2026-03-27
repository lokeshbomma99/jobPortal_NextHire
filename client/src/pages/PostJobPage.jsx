import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X, Save } from "lucide-react";
import { jobsAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const CATEGORIES = ["Technology", "Marketing", "Design", "Finance", "Healthcare", "Education", "Sales", "Engineering", "HR", "Legal", "Operations", "Other"];

const defaultForm = {
  title: "", description: "", category: "Technology",
  location: "", locationType: "onsite", type: "full-time", experience: "entry",
  requirements: [""], responsibilities: [""], skills: [""], benefits: [""],
  salary: { min: "", max: "", currency: "USD", period: "year", disclosed: true },
  deadline: "", status: "active",
};

// ✅ FIXED: SectionTitle moved OUTSIDE PostJobPage to prevent remount on every render
const SectionTitle = ({ children }) => (
  <h2
    className="text-base font-semibold text-white mb-4 pb-2"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Syne', sans-serif" }}
  >
    {children}
  </h2>
);

// ✅ FIXED: ArrayField moved OUTSIDE PostJobPage — now receives handlers as props
// This prevents React from remounting the input on every keystroke (focus loss bug)
const ArrayField = ({ label, fieldKey, placeholder, form, handleArrayChange, removeArrayItem, addArrayItem }) => (
  <div>
    <label className="text-sm font-medium text-slate-300 block mb-2">{label}</label>
    <div className="space-y-2">
      {form[fieldKey].map((val, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            type="text"
            value={val}
            onChange={(e) => handleArrayChange(fieldKey, idx, e.target.value)}
            placeholder={`${placeholder} ${idx + 1}`}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button
            type="button"
            onClick={() => removeArrayItem(fieldKey, idx)}
            className="p-2.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem(fieldKey)}
        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors mt-1"
      >
        <Plus size={14} /> Add {label.slice(0, -1)}
      </button>
    </div>
  </div>
);

export default function PostJobPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ ...defaultForm, companyName: user?.companyName || "" });
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    jobsAPI.getById(id)
      .then(({ data }) => {
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.industry || "Technology",
          location: data.location || "",
          locationType: data.isRemote ? "remote" : "onsite",
          type: data.jobType || "full-time",
          experience: data.experienceLevel || "entry",
          companyName: data.companyName || user?.companyName || "",
          salary: {
            min: data.salaryMin || "",
            max: data.salaryMax || "",
            currency: data.salaryCurrency || "USD",
            period: data.salaryPeriod || "year",
            disclosed: (data.salaryMin > 0 || data.salaryMax > 0),
          },
          requirements: data.requirements?.length ? data.requirements : [""],
          responsibilities: data.responsibilities?.length ? data.responsibilities : [""],
          skills: data.skills?.length ? data.skills : [""],
          benefits: [""],
          deadline: data.deadline ? data.deadline.split("T")[0] : "",
          status: data.status || "active",
        });
      })
      .catch(() => toast.error("Job not found"))
      .finally(() => setLoadingJob(false));
  }, [id, isEdit, user?.companyName]);

  const handleArrayChange = (key, idx, val) => {
    setForm(prev => {
      const arr = [...prev[key]];
      arr[idx] = val;
      return { ...prev, [key]: arr };
    });
  };

  const addArrayItem = (key) => setForm(prev => ({ ...prev, [key]: [...prev[key], ""] }));

  const removeArrayItem = (key, idx) => {
    setForm(prev => {
      const arr = prev[key].filter((_, i) => i !== idx);
      return { ...prev, [key]: arr.length ? arr : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      companyName: form.companyName || user?.companyName,
      jobType: form.type || "full-time",
      experienceLevel: form.experience || "entry",
      industry: form.category || "Technology",
      isRemote: form.locationType === "remote",
      salaryMin: parseInt(form.salary?.min) || 0,
      salaryMax: parseInt(form.salary?.max) || 0,
      salaryCurrency: form.salary?.currency || "USD",
      salaryPeriod: form.salary?.period || "year",
      requirements: form.requirements?.filter(Boolean) || [],
      responsibilities: form.responsibilities?.filter(Boolean) || [],
      skills: form.skills?.filter(Boolean) || [],
      deadline: form.deadline || undefined,
      status: form.status || "active",
    };

    try {
      if (isEdit) await jobsAPI.update(id, payload);
      else await jobsAPI.create(payload);
      toast.success(isEdit ? "Job updated!" : "Job posted!");
      navigate("/employer/dashboard");
    } catch (err) {
      console.error("Job save error:", err);
      toast.error(err.response?.data?.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          {isEdit ? "Edit Job Post" : "Post a New Job"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <SectionTitle>Basic Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Job Title *", name: "title", placeholder: "e.g. Senior React Developer" },
              { label: "Company Name", name: "companyName", placeholder: "Your company name" },
            ].map(({ label, name, placeholder }) => (
              <div key={name}>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
                <input
                  type="text"
                  value={form[name] || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, [name]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white"
                style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {[
              { label: "Work Mode", name: "locationType", options: ["onsite", "remote", "hybrid"] },
              { label: "Job Type", name: "type", options: ["full-time", "part-time", "contract", "internship", "freelance"] },
              { label: "Experience Level", name: "experience", options: ["entry", "mid", "senior", "lead", "executive"] },
              { label: "Status", name: "status", options: ["active", "draft", "closed"] },
            ].map(({ label, name, options }) => (
              <div key={name}>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
                <select
                  value={form[name]}
                  onChange={(e) => setForm(prev => ({ ...prev, [name]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white capitalize"
                  style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Application Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <SectionTitle>Job Description</SectionTitle>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role, team culture, and what makes this opportunity exciting..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 resize-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* Salary */}
        <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <SectionTitle>Compensation</SectionTitle>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="disclosed"
              checked={form.salary.disclosed}
              onChange={(e) => setForm(prev => ({ ...prev, salary: { ...prev.salary, disclosed: e.target.checked } }))}
              className="accent-red-500"
            />
            <label htmlFor="disclosed" className="text-sm text-slate-300">Show salary range</label>
          </div>
          {form.salary.disclosed && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Min Salary", name: "min", type: "number", placeholder: "50000" },
                { label: "Max Salary", name: "max", type: "number", placeholder: "80000" },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form.salary[name]}
                    onChange={(e) => setForm(prev => ({ ...prev, salary: { ...prev.salary, [name]: e.target.value } }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Currency</label>
                <select
                  value={form.salary.currency}
                  onChange={(e) => setForm(prev => ({ ...prev, salary: { ...prev.salary, currency: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white"
                  style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {["USD", "EUR", "GBP", "INR"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Per</label>
                <select
                  value={form.salary.period}
                  onChange={(e) => setForm(prev => ({ ...prev, salary: { ...prev.salary, period: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white"
                  style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {["hour", "month", "year"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Arrays — ✅ Now passing form + handlers as props */}
        <div className="p-6 rounded-2xl" style={{ background: "#1e2a47", border: "1px solid rgba(255,255,255,0.06)" }}>
          <SectionTitle>Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ArrayField
              label="Responsibilities"
              fieldKey="responsibilities"
              placeholder="Responsibility"
              form={form}
              handleArrayChange={handleArrayChange}
              removeArrayItem={removeArrayItem}
              addArrayItem={addArrayItem}
            />
            <ArrayField
              label="Requirements"
              fieldKey="requirements"
              placeholder="Requirement"
              form={form}
              handleArrayChange={handleArrayChange}
              removeArrayItem={removeArrayItem}
              addArrayItem={addArrayItem}
            />
            <ArrayField
              label="Skills"
              fieldKey="skills"
              placeholder="Skill"
              form={form}
              handleArrayChange={handleArrayChange}
              removeArrayItem={removeArrayItem}
              addArrayItem={addArrayItem}
            />
            <ArrayField
              label="Benefits"
              fieldKey="benefits"
              placeholder="Benefit"
              form={form}
              handleArrayChange={handleArrayChange}
              removeArrayItem={removeArrayItem}
              addArrayItem={addArrayItem}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#e94560" }}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={16} />
            }
            {isEdit ? "Save Changes" : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
}