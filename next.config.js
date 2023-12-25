const path = require("path");
const crypto = require("crypto-browserify");
const stream = require("stream-browserify");

module.exports = {
  webpack: (config, { isServer }) => {
    // Modify the Webpack config only if it's not the server-side build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // Spread the existing fallback (if any)
        fs: false, // Disable 'fs' module
        path: path.resolve(__dirname, "node_modules/path-browserify"), // Use 'path-browserify'
        crypto: crypto, // Use 'crypto-browserify'
        stream: stream, // Use 'stream-browserify'
      };
    }

    return config;
  },
};
