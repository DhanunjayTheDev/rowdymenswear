const calculateDiscount = (mrp, salePrice) => {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - salePrice) / mrp) * 100);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

module.exports = { calculateDiscount, formatPrice };
