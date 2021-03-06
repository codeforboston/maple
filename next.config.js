const isProduction = process.env.NODE_ENV === "production";
const withImages = require("next-images");

// module.exports = withImage();

module.exports = withImages({
  target: "serverless",
  assetPrefix: isProduction ? "/advocacy-maps" : "",
  basePath: isProduction ? "/advocacy-maps" : "",
});
