const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadRoot = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
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

const hasCloudinaryConfig = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const getBaseUrl = (req) => {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/$/, '');
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '');
  if (!req) return '';

  const protocolHeader = req.headers['x-forwarded-proto'];
  const protocol = protocolHeader ? protocolHeader.split(',')[0] : req.protocol || 'http';
  const host = req.get('host');
  return host ? `${protocol}://${host}` : '';
};

const getLocalFileUrl = (filePath, req) => {
  const baseUrl = getBaseUrl(req);
  const relativePath = `/uploads/${path.basename(filePath)}`;
  return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
};

const cleanupFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('File cleanup error:', err);
    }
  }
};

const uploadToCloudinary = async (filePath, folder = 'krishianaj', req) => {
  try {
    if (!hasCloudinaryConfig()) {
      return getLocalFileUrl(filePath, req);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
    });

    await cleanupFile(filePath);
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return getLocalFileUrl(filePath, req);
  }
};

module.exports = { upload, uploadToCloudinary, cloudinary };
