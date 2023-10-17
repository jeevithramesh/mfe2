const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const webpack = require("@angular-architects/module-federation/webpack");
const path = require("path");
const exposedPaths = require("../../exposed-paths.json")["mfe_2"];
const packageJsonDeps = require("../../shared-dependencies");
const sharedMappings = new webpack.SharedMappings();
sharedMappings.register(path.join(__dirname, "./tsconfig.app.json"));

const sharedPaths = {};
const packages = {};
const mfeName = "mfe_2";

Object.keys(packageJsonDeps).forEach((v) => {
  packages[v] = packageJsonDeps[v];
  packages[v].eager = false;
});
Object.keys(exposedPaths).forEach((v) => {
  sharedPaths[v.replace("./", mfeName + "/")] = {
    singleton: true,
    requiredVersion: "0.0.1",
    eager: false,
    strictVersion: false,
    import: exposedPaths[v].replace(".ts", ""),
  };
});

module.exports = {
  output: {
    uniqueName: mfeName,
    publicPath: mfeName + "/",
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: mfeName,
      library: { type: "var", name: mfeName },
      filename: "remoteEntry.js",
      exposes: {
        ...exposedPaths,
      },
      shared: {
        ...packages,
        ...sharedPaths,
      },
    }),
    sharedMappings.getPlugin(),
  ],
};
