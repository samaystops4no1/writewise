const path = require("path");

module.exports = {
    mode: "development",
    devtool: 'cheap-module-source-map',
    entry : "./background.js",
    output: {
        filename: "background.js",
        path: path.resolve(__dirname, "dest")
    }
};