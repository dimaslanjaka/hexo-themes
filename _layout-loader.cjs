const fs = require('fs-extra');
const path = require('upath');
const Hexo = require('hexo');

/**
 * read directory recursive
 * @param {string} dir
 * @param {(err: Error, list: string[]) => any} done
 */
const _walk = function (dir, done) {
  var results = [];

  fs.readdir(dir, function (err, list) {
    if (err) return done(err);

    var i = 0;

    (function next() {
      var file = list[i++];

      if (!file) return done(null, results);

      file = path.resolve(dir, file);

      fs.stat(file, function (_err, stat) {
        if (stat && stat.isDirectory()) {
          _walk(file, function (_err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

/**
 * Copy custom layouts into active theme directory
 * @param {string} base
 * @param {Hexo} hexo
 */
function copyLayouts(base, hexo) {
  const viewsDir = path.join(__dirname, 'views');

  if (!fs.existsSync(viewsDir)) {
    console.warn(`Views directory ${viewsDir} does not exist`);
    return;
  }

  const layouts = fs.readdirSync(viewsDir).map((str) => ({
    src: path.join(viewsDir, str),
    dest: path.join(hexo.theme_dir, str)
  }));

  layouts.forEach(({ src, dest }) => {
    if (!fs.existsSync(src)) {
      console.warn(`Source file ${src} does not exist, skipping...`);
      return;
    }

    console.log(`Copying ${path.relative(base, src)} to ${path.relative(base, dest)}...`);

    fs.copySync(src, dest);
  });
}

const _hexo = new Hexo(__dirname, {
  silent: true
});
_hexo
  .init()
  .then(() => {
    copyLayouts(__dirname, _hexo);
  })
  .finally(() => _hexo.exit());
