const cloudinary = require('../config/cloudinary');

const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return match ? match[1] : null;
};

const deleteCloudinaryImages = async (urls = []) => {
  const publicIds = [...new Set(urls.map(extractPublicId).filter(Boolean))];
  if (publicIds.length === 0) return;
  const results = await Promise.allSettled(publicIds.map(id => cloudinary.uploader.destroy(id)));
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`[cloudinary] Failed to delete ${publicIds[i]}:`, r.reason?.message || r.reason);
    }
  });
};

module.exports = { deleteCloudinaryImages, extractPublicId };
