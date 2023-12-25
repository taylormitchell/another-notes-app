module.exports = {
  webpack: (config, { isServer }) => {
    // Modify the Webpack config only if it's not the server-side build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // Spread the existing fallback (if any)
        fs: false, // Disable 'fs' module
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      };
    }

    return config;
  },
};
