import path from "path";

let base_dir = process.cwd();
if (typeof hexo !== "undefined") {
  base_dir = hexo.base_dir;
}

import { promises as fs } from "fs";

interface CacheOptions {
  expirationTime?: number; // Time in milliseconds
}

export class CacheHelper {
  private baseFolder: string;
  private cache: Map<string, { value: any; expiration?: number }> = new Map();

  constructor(baseFolder: string) {
    this.baseFolder = baseFolder;
  }

  private getCacheKey(key: string): string {
    return path.join(this.baseFolder, key);
  }

  public async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const expiration = options?.expirationTime ? Date.now() + options.expirationTime : undefined;

    this.cache.set(key, { value, expiration });
    await fs.writeFile(this.getCacheKey(key), JSON.stringify({ value, expiration }));
  }

  public async get<V>(key: string, fallback: V): Promise<V> {
    // Check memory cache first
    const cached = this.cache.get(key);
    if (cached) {
      if (cached.expiration === undefined || cached.expiration > Date.now()) {
        return cached.value;
      } else {
        this.cache.delete(key); // Remove expired entry
      }
    }

    // Check file cache
    try {
      const data = await fs.readFile(this.getCacheKey(key), "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.expiration === undefined || parsed.expiration > Date.now()) {
        this.cache.set(key, { value: parsed.value, expiration: parsed.expiration });
        return parsed.value;
      }
    } catch (_error) {
      // Ignore file read errors (e.g., file not found)
    }

    // Return fallback if no valid cache is found
    return fallback;
  }

  public async has(key: string): Promise<boolean> {
    const cached = this.cache.get(key);
    if (cached) {
      return cached.expiration === undefined || cached.expiration > Date.now();
    }

    try {
      const data = await fs.readFile(this.getCacheKey(key), "utf-8");
      const parsed = JSON.parse(data);
      return parsed.expiration === undefined || parsed.expiration > Date.now();
    } catch (_error) {
      return false; // File not found or parse error
    }
  }
}

/**
 * Reusable cache instance
 */
export const hexoThemesCache = new CacheHelper(path.join(base_dir, "tmp", "hexo-themes"));
