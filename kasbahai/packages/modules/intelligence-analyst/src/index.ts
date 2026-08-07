import type { AiGateway } from '@kasbahai/ai-gateway';
import {
  IntelligenceMapDraftSchema,
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
} from './schema';
import type { IntelligenceMapDraft } from './schema';

export { IntelligenceMapDraftSchema, OUTPUT_SCHEMA_VERSION, PROMPT_VERSION, SYSTEM_PROMPT };
export type { IntelligenceMapDraft };

export interface IntelligenceAnalystInput {
  cleanTranscriptText: string;
  modelId?: string;
}

/**
 * Module 2. Reads a Source Processor's clean transcript and produces the
 * single Source Intelligence Map every downstream module reads from. This
 * is the AI-gateway wiring for milestone 1; prompt quality, few-shot
 * examples, and evidence-reference resolution are milestone 2 work.
 */
export interface IntelligenceAnalyst {
  analyze(input: IntelligenceAnalystInput): Promise<IntelligenceMapDraft>;
}

export class DefaultIntelligenceAnalyst implements IntelligenceAnalyst {
  constructor(private readonly gateway: AiGateway) {}

  async analyze(input: IntelligenceAnalystInput): Promise<IntelligenceMapDraft> {
    const result = await this.gateway.generateStructured({
      promptVersion: PROMPT_VERSION,
      schemaVersion: OUTPUT_SCHEMA_VERSION,
      systemPrompt: SYSTEM_PROMPT,
      input: input.cleanTranscriptText,
      schema: IntelligenceMapDraftSchema,
      modelId: input.modelId,
    });
    return result.data;
  }
}
