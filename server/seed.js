require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Review = require('./src/models/Review');
const Order = require('./src/models/Order');
const Coupon = require('./src/models/Coupon');
const Wishlist = require('./src/models/Wishlist');
const Notification = require('./src/models/Notification');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      Coupon.deleteMany({}),
      Wishlist.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // === Categories ===
    const categoryData = [
      { name: 'T-Shirts', slug: 't-shirts', description: 'Premium cotton tees with bold street-ready designs', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', isActive: true },
      { name: 'Hoodies', slug: 'hoodies', description: 'Heavyweight hoodies built for the streets', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', isActive: true },
      { name: 'Jeans', slug: 'jeans', description: 'Slim and relaxed fit jeans with modern washes', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80', isActive: true },
      { name: 'Joggers', slug: 'joggers', description: 'Comfort meets style with our fleece joggers', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80', isActive: true },
      { name: 'Shorts', slug: 'shorts', description: 'Casual shorts for everyday swagger', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', isActive: true },
      { name: 'Accessories', slug: 'accessories', description: 'Caps, chains, and more to complete the look', image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80', isActive: true },
    ];
    const categories = await Category.insertMany(categoryData);
    console.log(`Inserted ${categories.length} categories`);

    // === Users ===
    const adminPassword = await bcrypt.hash('admin123', 12);
    const customerPassword = await bcrypt.hash('customer123', 12);
    const users = await User.insertMany([
      {
        name: 'Rowdy Admin',
        email: 'admin@rowdy.com',
        passwordHash: adminPassword,
        role: 'admin',
        avatar: '',
        addresses: [{ fullName: 'Rowdy Admin', phone: '9876543210', pincode: '400001', addressLine1: '123, BKC', city: 'Mumbai', state: 'Maharashtra', isDefault: true }],
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        passwordHash: customerPassword,
        role: 'customer',
        avatar: '',
        addresses: [{ fullName: 'Arjun Mehta', phone: '9876543211', pincode: '400002', addressLine1: '456, Andheri West', city: 'Mumbai', state: 'Maharashtra', isDefault: true }],
      },
      {
        name: 'Rohit Sharma',
        email: 'rohit@example.com',
        passwordHash: customerPassword,
        role: 'customer',
        avatar: '',
        addresses: [],
      },
    ]);
    console.log(`Inserted ${users.length} users`);

    // === Products ===
    // Palette matches admin's nearest-color-name detector: Black #111111, White #FFFFFF,
    // Red #E53935, Blue #1E88E5, Green #43A047, Grey #9E9E9E, Navy #1A237E, Olive #808000,
    // Brown #795548, Beige #F5F5DC.
    const productData = [
      { name: 'Classic Logo Tee', slug: 'classic-logo-tee', description: 'Our signature logo tee. 100% combed cotton with a relaxed fit. The everyday essential with attitude.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'], mrp: 1299, salePrice: 799, offerPercent: 38, sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 25 }, { size: 'XXL', stock: 10 }], color: 'Black', colorHex: '#111111', fit: 'Regular', fabric: 'Cotton', tags: ['street', 'casual'], isActive: true, averageRating: 4.5, totalReviews: 8, totalSold: 120,
        variants: [
          { color: 'Red', colorHex: '#E53935', slug: 'classic-logo-tee-red', images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'], sizes: [{ size: 'S', stock: 12 }, { size: 'M', stock: 22 }, { size: 'L', stock: 18 }, { size: 'XL', stock: 10 }] },
          { color: 'Blue', colorHex: '#1E88E5', slug: 'classic-logo-tee-blue', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600'], sizes: [{ size: 'M', stock: 16 }, { size: 'L', stock: 14 }, { size: 'XL', stock: 8 }] },
        ] },
      { name: 'Oversized Drop Shoulder Tee', slug: 'oversized-drop-shoulder-tee', description: 'Trending oversized fit with dropped shoulders. Heavyweight 240 GSM fabric.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'], mrp: 1599, salePrice: 999, offerPercent: 37, sizes: [{ size: 'M', stock: 30 }, { size: 'L', stock: 35 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 15 }], color: 'Grey', colorHex: '#9E9E9E', fit: 'Oversized', fabric: 'Cotton', tags: ['street', 'premium'], isActive: true, averageRating: 4.3, totalReviews: 5, totalSold: 85 },
      { name: 'Striped Street Tee', slug: 'striped-street-tee', description: 'Bold horizontal stripes for maximum street presence. Breathable cotton blend.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], mrp: 1399, salePrice: 899, offerPercent: 35, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 25 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 20 }], color: 'Navy', colorHex: '#1A237E', fit: 'Regular', fabric: 'Cotton', tags: ['street', 'casual'], isActive: true, averageRating: 4.1, totalReviews: 3, totalSold: 65 },
      { name: 'Premium Pique Polo', slug: 'premium-pique-polo', description: 'Class meets street. Pique cotton polo with embroidered logo. Perfect for smart casual.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=600', 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600'], mrp: 1999, salePrice: 1499, offerPercent: 25, sizes: [{ size: 'M', stock: 20 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }], color: 'White', colorHex: '#FFFFFF', fit: 'Regular', fabric: 'Cotton', tags: ['formal', 'premium'], isActive: true, averageRating: 4.6, totalReviews: 4, totalSold: 45 },
      { name: 'Essential Crew Neck Tee', slug: 'essential-crew-neck-tee', description: 'Minimalist crew neck tee. 180 GSM compact cotton jersey. Your everyday staple.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1582592072884-34fdb5e1473e?w=600', 'https://images.unsplash.com/photo-1586339949916-3e5457d58f0a?w=600'], mrp: 999, salePrice: 599, offerPercent: 40, sizes: [{ size: 'S', stock: 25 }, { size: 'M', stock: 40 }, { size: 'L', stock: 45 }, { size: 'XL', stock: 30 }, { size: 'XXL', stock: 15 }], color: 'Beige', colorHex: '#F5F5DC', fit: 'Regular', fabric: 'Cotton', tags: ['casual'], isActive: true, averageRating: 4.2, totalReviews: 6, totalSold: 200 },
      { name: 'Graphic Print Tee', slug: 'graphic-print-tee', description: 'Bold graphic print on heavyweight cotton. Makes a statement without saying a word.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', 'https://images.unsplash.com/photo-1571943364930-01a0f62d13f5?w=600'], mrp: 1499, salePrice: 1099, offerPercent: 26, sizes: [{ size: 'M', stock: 20 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }], color: 'Black', colorHex: '#111111', fit: 'Regular', fabric: 'Cotton', tags: ['street', 'sale'], isActive: true, averageRating: 4.0, totalReviews: 2, totalSold: 55 },
      // Hoodies
      { name: 'Classic Zip Hoodie', slug: 'classic-zip-hoodie', description: 'Full-zip heavyweight hoodie. brushed fleece interior for maximum comfort.', category: categories[1]._id, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600'], mrp: 2999, salePrice: 1999, offerPercent: 33, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 25 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 20 }], color: 'Black', colorHex: '#111111', fit: 'Regular', fabric: 'Fleece', tags: ['street', 'premium'], isActive: true, averageRating: 4.7, totalReviews: 10, totalSold: 90,
        variants: [
          { color: 'Olive', colorHex: '#808000', slug: 'classic-zip-hoodie-olive', images: ['https://images.unsplash.com/photo-1614975059405-d710e2d0220a?w=600', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'], sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 18 }, { size: 'L', stock: 15 }, { size: 'XL', stock: 8 }] },
          { color: 'Grey', colorHex: '#9E9E9E', slug: 'classic-zip-hoodie-grey', images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 'https://images.unsplash.com/photo-1604514628550-d374c889a2a0?w=600'], sizes: [{ size: 'M', stock: 14 }, { size: 'L', stock: 16 }, { size: 'XL', stock: 9 }] },
        ] },
      { name: 'Pullover Hoodie', slug: 'pullover-hoodie', description: 'Classic pullover with kangaroo pocket. 400 GSM brushed fleece. Street-ready warmth.', category: categories[1]._id, images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600'], mrp: 2799, salePrice: 1799, offerPercent: 35, sizes: [{ size: 'M', stock: 20 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }, { size: 'XXL', stock: 10 }], color: 'Grey', colorHex: '#9E9E9E', fit: 'Relaxed', fabric: 'Fleece', tags: ['street', 'casual'], isActive: true, averageRating: 4.4, totalReviews: 7, totalSold: 75 },
      { name: 'Cropped Zip Hoodie', slug: 'cropped-zip-hoodie', description: 'Modern cropped silhouette with full zip. Trendy and functional.', category: categories[1]._id, images: ['https://images.unsplash.com/photo-1614975059405-d710e2d0220a?w=600', 'https://images.unsplash.com/photo-1604514628550-d374c889a2a0?w=600'], mrp: 2599, salePrice: 1899, offerPercent: 26, sizes: [{ size: 'M', stock: 15 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }], color: 'Beige', colorHex: '#F5F5DC', fit: 'Slim', fabric: 'Fleece', tags: ['street', 'premium'], isActive: true, averageRating: 4.3, totalReviews: 3, totalSold: 40 },
      // Jeans
      { name: 'Slim Fit Black Jeans', slug: 'slim-fit-black-jeans', description: 'Slim fit black denim. Stretch comfort fabric. Wardrobe essential.', category: categories[2]._id, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600'], mrp: 2499, salePrice: 1799, offerPercent: 28, sizes: [{ size: '28', stock: 10 }, { size: '30', stock: 20 }, { size: '32', stock: 25 }, { size: '34', stock: 15 }, { size: '36', stock: 10 }], color: 'Black', colorHex: '#111111', fit: 'Slim', fabric: 'Denim', tags: ['street', 'formal'], isActive: true, averageRating: 4.5, totalReviews: 6, totalSold: 110 },
      { name: 'Relaxed Fit Light Wash', slug: 'relaxed-fit-light-wash', description: 'Relaxed fit light wash denim. Vintage-inspired with modern comfort.', category: categories[2]._id, images: ['https://images.unsplash.com/photo-1593032458809-6734071a5953?w=600', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'], mrp: 2699, salePrice: 1999, offerPercent: 25, sizes: [{ size: '30', stock: 15 }, { size: '32', stock: 20 }, { size: '34', stock: 12 }], color: 'Blue', colorHex: '#1E88E5', fit: 'Relaxed', fabric: 'Denim', tags: ['casual'], isActive: true, averageRating: 4.1, totalReviews: 4, totalSold: 60 },
      // Joggers
      { name: 'Cargo Joggers', slug: 'cargo-joggers', description: 'Cargo pocket joggers in fleece. Elastic ankle cuffs. Utility meets style.', category: categories[3]._id, images: ['https://images.unsplash.com/photo-1598550472440-0c1e38b1da65?w=600', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600'], mrp: 2199, salePrice: 1499, offerPercent: 31, sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 30 }, { size: 'L', stock: 35 }, { size: 'XL', stock: 20 }], color: 'Olive', colorHex: '#808000', fit: 'Regular', fabric: 'Fleece', tags: ['street', 'casual'], isActive: true, averageRating: 4.6, totalReviews: 9, totalSold: 150,
        variants: [
          { color: 'Black', colorHex: '#111111', slug: 'cargo-joggers-black', images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', 'https://images.unsplash.com/photo-1598550472440-0c1e38b1da65?w=600'], sizes: [{ size: 'S', stock: 14 }, { size: 'M', stock: 22 }, { size: 'L', stock: 24 }, { size: 'XL', stock: 12 }] },
        ] },
      { name: 'French Terry Joggers', slug: 'french-terry-joggers', description: 'Premium french terry joggers. Soft inside, smooth outside. Lounge in style.', category: categories[3]._id, images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600', 'https://images.unsplash.com/photo-1609050470947-f35a7d0c0a01?w=600'], mrp: 1999, salePrice: 1399, offerPercent: 30, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 25 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 15 }], color: 'Grey', colorHex: '#9E9E9E', fit: 'Relaxed', fabric: 'French Terry', tags: ['casual', 'premium'], isActive: true, averageRating: 4.4, totalReviews: 5, totalSold: 80 },
      // Shorts
      { name: 'Cotton Cargo Shorts', slug: 'cotton-cargo-shorts', description: 'Cargo shorts in breathable cotton. Multiple pockets. Perfect for summer.', category: categories[4]._id, images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'], mrp: 1499, salePrice: 999, offerPercent: 33, sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 30 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }], color: 'Beige', colorHex: '#F5F5DC', fit: 'Regular', fabric: 'Cotton', tags: ['street', 'casual'], isActive: true, averageRating: 4.2, totalReviews: 4, totalSold: 70 },
      { name: 'Athletic Shorts', slug: 'athletic-shorts', description: 'Performance athletic shorts. Moisture-wicking fabric. Built for movement.', category: categories[4]._id, images: ['https://images.unsplash.com/photo-1565693413570-8ff0c7564b10?w=600', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600'], mrp: 1299, salePrice: 899, offerPercent: 30, sizes: [{ size: 'M', stock: 20 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }], color: 'Black', colorHex: '#111111', fit: 'Athletic', fabric: 'Polyester', tags: ['sport', 'casual'], isActive: true, averageRating: 4.0, totalReviews: 2, totalSold: 45 },
      // Accessories
      { name: 'Rowdy Cap', slug: 'rowdy-cap', description: 'Structured 6-panel cap with embroidered logo. Adjustable strap. One size fits most.', category: categories[5]._id, images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600'], mrp: 999, salePrice: 699, offerPercent: 30, sizes: [{ size: 'One Size', stock: 50 }], color: 'Black', colorHex: '#111111', fabric: 'Cotton', tags: ['street', 'casual'], isActive: true, averageRating: 4.3, totalReviews: 3, totalSold: 60 },
      { name: 'Metal Chain Necklace', slug: 'metal-chain-necklace', description: 'Premium stainless steel chain. Hypoallergenic. Adds edge to any outfit.', category: categories[5]._id, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 'https://images.unsplash.com/photo-1599643477872-8eb5cdeec338?w=600'], mrp: 799, salePrice: 499, offerPercent: 37, sizes: [{ size: 'One Size', stock: 40 }], color: 'Grey', colorHex: '#9E9E9E', tags: ['street', 'premium'], isActive: true, averageRating: 4.1, totalReviews: 2, totalSold: 35 },
    ];
    const products = await Product.insertMany(productData);
    console.log(`Inserted ${products.length} products`);

    // === Reviews ===
    const reviewData = [
      { user: users[1]._id, product: products[0]._id, rating: 5, comment: 'Absolutely love this tee! The fabric quality is amazing and the fit is perfect. Been wearing it everywhere.' },
      { user: users[2]._id, product: products[0]._id, rating: 4, comment: 'Great quality for the price. Would recommend going one size up for an oversized look.' },
      { user: users[1]._id, product: products[6]._id, rating: 5, comment: 'Best hoodie I have ever owned. So warm and comfortable. The zip quality is excellent.' },
      { user: users[2]._id, product: products[6]._id, rating: 4, comment: 'Nice hoodie. Fabric is thick and warm. Colour is exactly as shown in pictures.' },
      { user: users[1]._id, product: products[12]._id, rating: 5, comment: 'These cargo joggers are fire! Super comfortable and the pockets are actually useful.' },
      { user: users[2]._id, product: products[12]._id, rating: 4, comment: 'Great joggers. The fit is relaxed which is what I wanted. Will buy more colours.' },
      { user: users[1]._id, product: products[9]._id, rating: 5, comment: 'Perfect fit! The stretch denim is a game changer. Black goes with everything.' },
    ];
    const reviews = await Review.insertMany(reviewData);
    console.log(`Inserted ${reviews.length} reviews`);

    // === Coupons ===
    const now = new Date();
    const couponData = [
      { code: 'FIRST50', description: 'Flat ₹50 off on your first order', discountType: 'FLAT', value: 50, minOrderAmount: 499, maxDiscountValue: 50, validFrom: now, validTo: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), isActive: true, usageLimit: 100, usedCount: 0 },
      { code: 'ROWDY20', description: '20% off on all streetwear', discountType: 'PERCENT', value: 20, minOrderAmount: 999, maxDiscountValue: 500, validFrom: now, validTo: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), isActive: true, usageLimit: 50, usedCount: 0 },
      { code: 'FREESHIP', description: 'Free shipping on orders above ₹999', discountType: 'FLAT', value: 99, minOrderAmount: 999, maxDiscountValue: 99, validFrom: now, validTo: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), isActive: true, usageLimit: 200, usedCount: 0 },
      { code: 'SALE30', description: '30% off on sale items', discountType: 'PERCENT', value: 30, minOrderAmount: 499, maxDiscountValue: 750, validFrom: now, validTo: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), isActive: true, usageLimit: 100, usedCount: 0 },
    ];
    const coupons = await Coupon.insertMany(couponData);
    console.log(`Inserted ${coupons.length} coupons`);

    // === Wishlist ===
    const wishlistData = [
      { user: users[1]._id, products: [products[0]._id, products[6]._id, products[12]._id] },
    ];
    const wishlists = await Wishlist.insertMany(wishlistData);
    console.log(`Inserted ${wishlists.length} wishlist`);

    // === Order ===
    const orderData = {
      user: users[1]._id,
      items: [
        { product: products[0]._id, name: 'Classic Logo Tee', image: products[0].images[0], size: 'L', quantity: 2, price: 799 },
        { product: products[6]._id, name: 'Classic Zip Hoodie', image: products[6].images[0], size: 'L', quantity: 1, price: 1999 },
      ],
      shippingAddress: {
        fullName: 'Arjun Mehta',
        phone: '9876543211',
        pincode: '400002',
        addressLine1: '456, Andheri West',
        addressLine2: '',
        city: 'Mumbai',
        state: 'Maharashtra',
      },
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      subtotal: 3597,
      discount: 0,
      shippingCost: 0,
      total: 3597,
    };
    const orders = await Order.insertMany([orderData]);
    console.log(`Inserted ${orders.length} order`);

    console.log('\n--- Seed Complete ---');
    console.log('Admin Login: admin@rowdy.com / admin123');
    console.log('Customer Login: arjun@example.com / customer123\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
