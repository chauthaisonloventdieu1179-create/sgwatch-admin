/** @type {import('next').NextConfig} */
const nextConfig = {
  //reactStrictMode: true,
  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  output: "export",
};

export default nextConfig;
