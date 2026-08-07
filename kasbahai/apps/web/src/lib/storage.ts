import { createObjectStorageFromEnv, type ObjectStorage } from '@kasbahai/storage';

let instance: ObjectStorage | undefined;

export function getObjectStorage(): ObjectStorage {
  instance ??= createObjectStorageFromEnv();
  return instance;
}
