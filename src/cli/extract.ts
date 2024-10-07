import fs from "fs-extra";
import * as tar from "tar";

/**
 * Extracts a specific subdirectory from a `.tgz` file to an output directory.
 *
 * @param filePath - The path to the `.tgz` file.
 * @param outputDir - The directory where files will be extracted.
 * @param subPath - The subdirectory within the `.tgz` archive to extract (e.g., 'package/').
 * @param strip - Whether to strip the leading subdirectory from the extracted files. If true, the leading subdirectory (e.g., 'package/') will be removed. Defaults to `false`.
 * @returns - A promise that resolves when extraction is complete.
 */
export async function extractTarGz(filePath: string, outputDir: string, subPath?: string, strip: boolean = false) {
  try {
    // Ensure the output directory exists
    await fs.ensureDir(outputDir);

    // Extract the contents of the tarball
    await tar.x({
      file: filePath,
      C: outputDir,
      filter: (file) => (subPath ? file.startsWith(subPath) : true), // Extract only files under subPath, or all files if subPath is not specified
      strip: strip ? 1 : undefined // Remove the leading subdirectory (e.g., 'package/') if strip is true
    });

    console.log(`Extracted ${subPath ? subPath : "all contents"} from ${filePath} to ${outputDir}`);
    return true;
  } catch (error) {
    console.error(`Error extracting ${subPath ? subPath : "all contents"} from ${filePath}:`, error);
    return false;
  }
}
