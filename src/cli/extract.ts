import fs from "fs-extra";
import { installPackage } from "./packageManager.js";

async function ensureTarInstalled() {
  try {
    return await import("tar");
  } catch (err: any) {
    if (err.code === "ERR_MODULE_NOT_FOUND" || err.message?.includes("Cannot find package 'tar'")) {
      installPackage("tar");

      return await import("tar");
    }

    throw err;
  }
}

/**
 * Extracts a specific subdirectory from a `.tgz` file to an output directory.
 */
export async function extractTarGz(filePath: string, outputDir: string, subPath?: string, strip: boolean = false) {
  const tar = await ensureTarInstalled();

  try {
    await fs.ensureDir(outputDir);

    await tar.x({
      file: filePath,
      C: outputDir,
      filter: (file) => (subPath ? file.startsWith(subPath) : true),
      strip: strip ? 1 : undefined
    });

    console.log(`Extracted ${subPath ?? "all contents"} from ${filePath} to ${outputDir}`);

    return true;
  } catch (error) {
    console.error(`Error extracting ${subPath ?? "all contents"} from ${filePath}:`, error);

    return false;
  }
}
