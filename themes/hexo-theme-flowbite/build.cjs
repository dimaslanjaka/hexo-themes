const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const importPlugin = require("postcss-import");
const sass = require("sass");
const fs = require("fs-extra");
const path = require("path");

const inputSCSS = path.resolve(__dirname, "src/style.scss");

const compile = async (outputCSS) => {
  try {
    await fs.ensureDir(path.dirname(outputCSS));
    // First, compile SCSS using the new compile method
    const sassResult = sass.compile(inputSCSS, {
      style: "compressed"
    });

    // Write the compiled CSS
    fs.writeFileSync(outputCSS, sassResult.css);

    // Then, process with PostCSS
    const postCssResult = await postcss([importPlugin, tailwindcss, autoprefixer]).process(sassResult.css, {
      from: inputSCSS,
      to: outputCSS
    });

    // Write processed CSS
    fs.writeFileSync(outputCSS, postCssResult.css);

    console.log("CSS processed successfully!", outputCSS);
  } catch (error) {
    console.error("Error processing CSS:", error);
  }
};

async function compileFlowbite() {
  await compile(path.resolve(__dirname, "source/css/style.css"));
}

compileFlowbite()
