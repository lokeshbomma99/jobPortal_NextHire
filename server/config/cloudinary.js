const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "job-portal/resumes",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "job-portal/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

const companyLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "job-portal/logos",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

module.exports = { cloudinary: cloudinary.v2, resumeStorage, avatarStorage, companyLogoStorage };
