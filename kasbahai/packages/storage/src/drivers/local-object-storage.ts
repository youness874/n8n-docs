import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { dirname, isAbsolute, join, normalize, relative } from 'node:path';
import type { ObjectStorage, PutObjectInput } from '../types';

export class LocalObjectStorage implements ObjectStorage {
  readonly name = 'local';

  constructor(private readonly rootDir: string) {}

  async put(input: PutObjectInput): Promise<{ key: string }> {
    const path = this.resolvePath(input.key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, input.body);
    return { key: input.key };
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.resolvePath(key));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(this.resolvePath(key), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolvePath(key), { force: true });
  }

  private resolvePath(key: string): string {
    if (isAbsolute(key)) {
      throw new Error(`Object key must be relative, got "${key}"`);
    }
    const path = normalize(join(this.rootDir, key));
    if (relative(this.rootDir, path).startsWith('..')) {
      throw new Error(`Object key "${key}" escapes the storage root`);
    }
    return path;
  }
}
