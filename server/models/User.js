const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["seeker", "employer", "admin"], default: "seeker" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },

    // Seeker fields
    skills: [{ type: String }],
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    resume: { type: String, default: "" },
    resumeOriginalName: { type: String, default: "" },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    portfolio: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    github: { type: String, default: "" },

    // Employer fields
    companyName: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companyDescription: { type: String, default: "" },
    companySize: { type: String, default: "" },
    industry: { type: String, default: "" },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
