const fs = require('fs-extra');
const path = require('upath');
const { parse, stringify } = require('yaml');
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
 * reload `_config.yml` from `_config.base.yml`
 * @param {string} [base] site directory with `_config.base.yml` inside
 * @param {import('hexo')['config']&Record<string,any>} overriden new config object to be merged
 * @returns {import('hexo')['config']&Record<string,any>}
 */
async function reloadHexoConfigYml(base = undefined, overriden = {}) {
  if (!base) base = __dirname;
  if (!overriden) overriden = {};
  const defaults = parse(fs.readFileSync(path.join(base, '_config.base.yml'), 'utf-8'));
  /** @type {import('hexo')['config']} */
  const options = Object.assign(defaults, overriden);
  // save new _config.yml
  fs.writeFileSync(path.join(base, '_config.yml'), stringify(options));

  process.cwd = () => base;
  const hexo = new Hexo(base, { ...options, silent: true });
  await hexo.init();
  const layouts = fs.readdirSync(path.join(__dirname, 'views')).map((str) => {
    return {
      src: path.join(path.join(__dirname, 'views'), str),
      dest: path.join(hexo.theme_dir, str)
    };
  });
  layouts.forEach(({ src, dest }) => {
    if (!fs.existsSync(src)) {
      console.warn(`Source file ${src} does not exist, skipping...`);
      return;
    }

    console.log(`Copying ${path.relative(base, src)} to ${path.relative(base, dest)}...`);
    fs.copySync(src, dest);
  });
  await hexo.exit();
  return options;
}

module.exports = reloadHexoConfigYml;

if (require.main === module && process.argv.some((arg) => arg.endsWith('_config.loader.cjs'))) {
  reloadHexoConfigYml(__dirname, {
    theme: 'hexo-theme-flowbite',
    renderers: {
      engines: ['ejs', 'stylus', 'nunjucks', 'dartsass', 'pug', 'sass', 'markdown-it', 'rollup'],
      generator: ['related-posts', 'meta'],
      html_tags: ['summary', 'details', 'detail'],
      fix: {
        html: true
      }
    }
  })
  // reloadHexoConfigYml(__dirname, { theme: 'claudia' });
}
