import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // Disables ESLint during production builds.
        ignoreDuringBuilds: true,
    },
    /* Other config options here */
};

export default nextConfig;