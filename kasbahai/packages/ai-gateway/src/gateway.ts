import type { z } from 'zod';
import { AiGatewayInvalidJsonError, AiGatewaySchemaValidationError } from './errors';
import type { AiProvider, GeneratedResult } from './types';

export interface GenerateStructuredParams<Schema extends z.ZodTypeAny> {
  /** Identifies which prompt template produced systemPrompt, for audit trails. */
  promptVersion: string;
  systemPrompt: string;
  /** Untrusted content (e.g. transcript text). Never merged into systemPrompt. */
  input: string;
  schema: Schema;
  /** Identifies the schema shape/version being validated against, for audit trails. */
  schemaVersion: string;
  modelId?: string;
}

/**
 * The single choke point every AI call in KasbahAI goes through. Callers
 * never talk to a provider SDK directly: they ask the gateway for a
 * structured result, and get back data that has already been parsed and
 * validated against the schema they asked for.
 */
export class AiGateway {
  constructor(
    private readonly provider: AiProvider,
    private readonly defaultModelId: string,
  ) {}

  async generateStructured<Schema extends z.ZodTypeAny>(
    params: GenerateStructuredParams<Schema>,
  ): Promise<GeneratedResult<z.infer<Schema>>> {
    const modelId = params.modelId ?? this.defaultModelId;

    const raw = await this.provider.complete({
      modelId,
      systemPrompt: params.systemPrompt,
      input: params.input,
    });

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch (cause) {
      throw new AiGatewayInvalidJsonError(raw, cause);
    }

    const result = params.schema.safeParse(parsedJson);
    if (!result.success) {
      throw new AiGatewaySchemaValidationError(raw, result.error);
    }

    return {
      data: result.data,
      modelId,
      promptVersion: params.promptVersion,
      schemaVersion: params.schemaVersion,
      raw,
      generatedAt: new Date(),
    };
  }
}
