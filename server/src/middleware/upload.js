const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || 'rowdy-mens-wear', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const uploadImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  try {
    const urls = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
    req.imageUrls = urls;
    next();
  } catch (error) {
    next(error);
  }
};

const uploadSingleImage = async (req, res, next) => {
  if (!req.file) return next();
  try {
    req.imageUrl = await uploadToCloudinary(req.file.buffer);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadImages, uploadSingleImage };
