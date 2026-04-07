const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadToCloudinary = async (filePath, folder = 'krishianaj') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
    });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return `/uploads/${path.basename(filePath)}`;
  }
};

module.exports = { upload, uploadToCloudinary, cloudinary };
