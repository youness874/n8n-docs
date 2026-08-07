/**
 * A completion request always keeps the system instruction and the
 * (untrusted) source content as separate fields. Providers must never
 * concatenate `input` into `systemPrompt` — this is what stops transcript
 * text from being able to smuggle instructions to the model.
 */
export interface AiCompletionRequest {
  modelId: string;
  systemPrompt: string;
  input: string;
  maxOutputTokens?: number;
}

export interface AiProvider {
  readonly name: string;
  complete(request: AiCompletionRequest): Promise<string>;
}

export interface GeneratedResult<T> {
  data: T;
  modelId: string;
  promptVersion: string;
  schemaVersion: string;
  raw: string;
  generatedAt: Date;
}
