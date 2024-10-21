export function getHexoArgs() {
  // detect hexo arguments
  let hexoCmd = "";
  if (hexo.env.args._ && hexo.env.args._.length > 0) {
    for (let i = 0; i < hexo.env.args._.length; i++) {
      if (hexo.env.args._[i] == "s" || hexo.env.args._[i] == "server") {
        hexoCmd = "server";
        break;
      }
      if (hexo.env.args._[i] == "d" || hexo.env.args._[i] == "deploy") {
        hexoCmd = "deploy";
        break;
      }
      if (hexo.env.args._[i] == "g" || hexo.env.args._[i] == "generate") {
        hexoCmd = "generate";
        break;
      }
      if (hexo.env.args._[i] == "c" || hexo.env.args._[i] == "clean") {
        hexoCmd = "clean";
        break;
      }
    }
  }
  return hexoCmd;
}
