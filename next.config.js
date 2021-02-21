const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  assetPrefix: isProduction ? "/advocacy-maps" : "",
  basePath: isProduction ? "/advocacy-maps" : "",
};
