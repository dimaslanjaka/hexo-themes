import fs from "fs-extra";
import path from "path";

export const searchFiles = [
  path.join(hexo.base_dir, hexo.config.source_dir, "hexo-search.json"),
  path.join(hexo.base_dir, hexo.config.public_dir, "hexo-search.json")
];

// Queue to hold the save operations
const saveQueue: (() => Promise<void>)[] = [];
let isProcessing = false;

/**
 * Initializes the search files if they don't exist.
 */
async function initializeSearchFiles() {
  for (const file of searchFiles) {
    if (!fs.existsSync(file)) {
      await fs.ensureDir(path.dirname(file));
      await fs.writeJSON(file, []);
    }
  }
}

/**
 * Saves data as search in JSON files, processing requests in a queue.
 *
 * @param data - The object containing url, title, and description to save.
 */
export async function saveAsSearch(data: { url: string; title: string; description: string }) {
  // Create a promise to handle the save operation
  const saveOperation = async () => {
    await initializeSearchFiles(); // Ensure the files are initialized

    const existingDataPromises = searchFiles.map((file) => fs.readJSON(file)); // Read existing data from all files
    const existingDataArray = await Promise.all(existingDataPromises); // Wait for all read operations to complete

    existingDataArray.forEach((existingData) => {
      appendOrReplace(existingData, data); // Append or replace data in each existing data array
    });

    const writePromises = searchFiles.map((file, index) => fs.writeJSON(file, existingDataArray[index])); // Write updated data back to each file
    await Promise.all(writePromises); // Wait for all write operations to complete
  };

  // Add the save operation to the queue
  saveQueue.push(saveOperation);

  // Process the queue if not already processing
  scheduleProcessing();
}

/**
 * Processes the save queue one operation at a time.
 */
async function scheduleProcessing() {
  if (isProcessing || saveQueue.length === 0) {
    return; // If already processing or no items in the queue, exit
  }

  isProcessing = true;

  const currentOperation = saveQueue.shift(); // Get the next operation from the queue
  if (currentOperation) {
    try {
      await currentOperation(); // Execute the operation
    } catch (error) {
      hexo.log.error("Error saving search data:", error.message);
    } finally {
      isProcessing = false; // Mark processing as complete
      scheduleProcessing(); // Continue to the next item in the queue
    }
  }
}

/**
 * Appends a new object to the array or replaces an existing object
 * based on the 'url' property, after validating that the 'url' is not empty.
 *
 * @param array - The array of objects to update.
 * @param newObj - The new object to add or replace.
 */
function appendOrReplace(
  array: { url: string; [key: string]: any }[],
  newObj: { url: string; [key: string]: any }
): void {
  // Validate that the url is not empty
  if (!newObj.url || typeof newObj.url !== "string") {
    hexo.log.warn("Invalid URL: The 'url' property must be a non-empty string.");
    return; // Exit the function if the URL is invalid
  }

  const index = array.findIndex((item) => item.url === newObj.url);
  if (index !== -1) {
    // Replace the existing object
    array[index] = newObj;
  } else {
    // Append the new object
    array.push(newObj);
  }
}
