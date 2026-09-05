// next.config.js
const nextConfig = {
  images: {
    unoptimized: true, // <- ✅ this disables image optimization
  },
  output: "export", // <- your existing static export setting
};

module.exports = nextConfig;
