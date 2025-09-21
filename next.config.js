/** @type {import('next').NextConfig} */
module.exports = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  }, 
  reactStrictMode: false,
  experimental: {
    appDir: false
  }
}
