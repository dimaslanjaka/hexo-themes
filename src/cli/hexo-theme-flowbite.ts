import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { extractTarGz } from "./extract";

const url = "https://github.com/dimaslanjaka/hexo-themes/raw/master/releases/hexo-theme-flowbite.tgz";
const filePath = path.join(process.cwd(), "tmp", "hexo-theme-flowbite.tgz");
const outputDir = path.join(process.cwd(), "themes", "hexo-theme-flowbite");

async function downloadFile(): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function main() {
  try {
    await downloadFile();
    console.log("Download completed!");
  } catch (err) {
    console.error("Error downloading file:", err);
  }

  try {
    await extractTarGz(filePath, outputDir, "package/", true);
  } catch (err) {
    console.error("Error extracting file:", err);
  }
}

main();
