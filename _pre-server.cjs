const reloadHexoConfigYml = require('./_config.loader.cjs');
const { spawn } = require('child_process');
const path = require('upath');
const fs = require('fs-extra');
const cwd = process.env.INIT_CWD || process.cwd();

// Run commands in a cross-platform way and suppress non-zero exit.
function run(command, args = [], opts = { stdio: 'inherit' }) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      cwd: __dirname,
      ...opts
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      if (opts.stdio === 'inherit') process.stdout.write(data);
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      if (opts.stdio === 'inherit') process.stderr.write(data);
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr,
        child
      });
    });

    child.on('error', (error) => {
      resolve({
        code: 1,
        stdout,
        stderr,
        error,
        child
      });
    });
  });
}

async function configLoader() {
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
  });
}

async function main() {
  try {
    await configLoader();
  } catch (err) {
    console.error('Failed to load configuration:');
    console.error(err.stack || err.message);
  }

  // finish with success to suppress npm failure
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error during postinstall:');
  console.error(err.stack || err.message);
  process.exit(0); // exit with success to suppress npm failure
});
