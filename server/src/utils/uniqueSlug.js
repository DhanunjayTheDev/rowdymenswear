const Product = require('../models/Product');
const slugify = require('./slugify');

async function slugTaken(slug, excludeProductId) {
  const filter = { $or: [{ slug }, { 'variants.slug': slug }] };
  if (excludeProductId) filter._id = { $ne: excludeProductId };
  return Product.exists(filter);
}

// Assigns a unique base slug and per-variant slugs (e.g. "product-name-red"),
// avoiding collisions both across the DB and within the same request's variant list.
async function assignProductSlugs({ name, variants = [], productId }) {
  const used = new Set();
  const baseCandidate = slugify(name);
  let base = baseCandidate;
  let n = 2;
  while (used.has(base) || await slugTaken(base, productId)) {
    base = `${baseCandidate}-${n++}`;
  }
  used.add(base);

  const resolvedVariants = [];
  for (const variant of variants) {
    const candidateBase = slugify(`${name}-${variant.color}`);
    let candidate = candidateBase;
    let m = 2;
    while (used.has(candidate) || await slugTaken(candidate, productId)) {
      candidate = `${candidateBase}-${m++}`;
    }
    used.add(candidate);
    resolvedVariants.push({ ...variant, slug: candidate });
  }

  return { slug: base, variants: resolvedVariants };
}

module.exports = { assignProductSlugs };
