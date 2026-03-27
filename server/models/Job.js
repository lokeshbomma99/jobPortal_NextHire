const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: [{ type: String }],
    
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    companyLogo: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    
    location: { type: String, required: true },
    isRemote: { type: Boolean, default: false },
    jobType: { type: String, enum: ["full-time", "part-time", "contract", "internship", "freelance"], default: "full-time" },
    experienceLevel: { type: String, enum: ["entry", "mid", "senior", "lead", "executive"], default: "entry" },
    industry: { type: String, default: "" },
    
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    salaryCurrency: { type: String, default: "USD" },
    salaryPeriod: { type: String, enum: ["hour", "month", "year"], default: "year" },
    
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
    deadline: { type: Date },
    
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
    views: { type: Number, default: 0 },
    
    featured: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", companyName: "text", skills: "text" });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1, status: 1 });

module.exports = mongoose.model("Job", jobSchema);
