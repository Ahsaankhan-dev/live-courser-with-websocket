import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.dirname(import.meta.url),
  },
};

export default nextConfig;