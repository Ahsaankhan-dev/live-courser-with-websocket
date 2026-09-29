import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid React's development-only effect replay opening and immediately
  // closing a second WebSocket during dashboard mount.
  reactStrictMode: false,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
