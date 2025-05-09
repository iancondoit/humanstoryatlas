/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  
  // Only use the src directory for the application
  distDir: '.next',
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  
  // Support Heroku deployment
  env: {
    PORT: process.env.PORT || 3000,
  },
  
  // Override the default webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Limit webpack to only include files from the src directory
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/archive/**', '**/docs/**']
    };
    
    return config;
  }
};

export default nextConfig; 