/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/image-proxy/inat/:path*",
        destination: "https://inaturalist-open-data.s3.amazonaws.com/:path*",
      },
      {
        source: "/api/image-proxy/ebird/:path*",
        destination: "https://cdn.download.ams.birds.cornell.edu/:path*",
      },
      {
        source: "/api/image-proxy/wikipedia/:path*",
        destination: "https://upload.wikimedia.org/:path*",
      },
      {
        source: "/api/image-proxy/flickr/:path*",
        destination: "https://live.staticflickr.com/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
