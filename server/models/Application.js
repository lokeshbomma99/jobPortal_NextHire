const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    coverLetter: { type: String, default: "" },
    resume: { type: String },
    resumeOriginalName: { type: String },
    
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"],
      default: "pending",
    },
    
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    
    employerNote: { type: String, default: "" },
    interviewDate: { type: Date },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
