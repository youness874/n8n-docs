import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocalObjectStorage } from './drivers/local-object-storage';

describe('LocalObjectStorage', () => {
  let root: string;
  let storage: LocalObjectStorage;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'kasbahai-storage-'));
    storage = new LocalObjectStorage(root);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('writes and reads back an object by key', async () => {
    await storage.put({ key: 'transcripts/abc.txt', body: 'hello world' });
    const content = await storage.get('transcripts/abc.txt');
    expect(content.toString('utf8')).toBe('hello world');
  });

  it('reports whether a key exists', async () => {
    expect(await storage.exists('missing.txt')).toBe(false);
    await storage.put({ key: 'present.txt', body: 'x' });
    expect(await storage.exists('present.txt')).toBe(true);
  });

  it('deletes an object', async () => {
    await storage.put({ key: 'to-delete.txt', body: 'x' });
    await storage.delete('to-delete.txt');
    expect(await storage.exists('to-delete.txt')).toBe(false);
  });

  it('rejects a key that attempts to escape the storage root', async () => {
    await expect(storage.get('../../etc/passwd')).rejects.toThrow('escapes the storage root');
  });

  it('rejects an absolute key', async () => {
    await expect(storage.get('/etc/passwd')).rejects.toThrow('must be relative');
  });
});
