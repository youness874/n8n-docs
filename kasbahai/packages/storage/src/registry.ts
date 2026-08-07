import { LocalObjectStorage } from './drivers/local-object-storage';
import type { ObjectStorage } from './types';

export function createObjectStorageFromEnv(env: NodeJS.ProcessEnv = process.env): ObjectStorage {
  const driver = env.STORAGE_DRIVER ?? 'local';

  switch (driver) {
    case 'local':
      return new LocalObjectStorage(env.STORAGE_LOCAL_ROOT ?? './.data/storage');
    default:
      throw new Error(
        `Unknown STORAGE_DRIVER "${driver}". Register a driver in packages/storage/src/registry.ts.`,
      );
  }
}
