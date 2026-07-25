export interface PutObjectInput {
  key: string;
  body: string | Buffer;
  contentType?: string;
}

/**
 * Files (transcripts, generated assets) live in object storage, not in
 * Postgres. The local-disk driver is for dev/tests; a production driver
 * (S3-compatible) implements the same interface.
 */
export interface ObjectStorage {
  readonly name: string;
  put(input: PutObjectInput): Promise<{ key: string }>;
  get(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}
