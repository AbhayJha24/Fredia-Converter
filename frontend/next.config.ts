import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Do not remove this line! Otherwise next app will pick lock file from top level directory
  outputFileTracingRoot: __dirname,

  // Build static app
  output: 'export',

  // Use relative paths
  assetPrefix: './'
};

export default nextConfig;
