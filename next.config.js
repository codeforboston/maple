const isProduction = process.env.NODE_ENV === "production";
const withImages = require("next-images");

// module.exports = withImage();

module.exports = withImages({
  assetPrefix: isProduction ? "https://d-ondrich.github.io/advocacy-maps/" : "",
  basePath: isProduction ? "" : "",
});
