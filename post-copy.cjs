process.env.DEBUG = "sbg-*,post:*,post,clean:*,clean";
process.cwd = () => __dirname;

const sbgApi = require("sbg-api");

const api = new sbgApi.Application(__dirname);
api.clean("all").catch(console.error);
// api.copy("stream");
