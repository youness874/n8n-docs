import type { AiGateway } from '@kasbahai/ai-gateway';
import {
  MasterVideoVersionDraftSchema,
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
} from './schema';
import type { MasterVideoVersionDraft } from './schema';

export {
  MasterVideoVersionDraftSchema,
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
} from './schema';
export type { MasterVideoVersionDraft } from './schema';

export interface ScriptEngineInput {
  /** JSON-serialized selected VideoConcept plus its Source Intelligence Map. */
  conceptAndIntelligenceText: string;
  modelId?: string;
}

/**
 * Module 4. Turns a selected Video Concept into a complete Master Video
 * Version — strategy, structure, full script, and publishing package —
 * ready for the quality gates (originality/accuracy/content/brand) before
 * it can become the approved MasterVideo.
 */
export interface ScriptEngine {
  createVersion(input: ScriptEngineInput): Promise<MasterVideoVersionDraft>;
}

export class DefaultScriptEngine implements ScriptEngine {
  constructor(private readonly gateway: AiGateway) {}

  async createVersion(input: ScriptEngineInput): Promise<MasterVideoVersionDraft> {
    const result = await this.gateway.generateStructured({
      promptVersion: PROMPT_VERSION,
      schemaVersion: OUTPUT_SCHEMA_VERSION,
      systemPrompt: SYSTEM_PROMPT,
      input: input.conceptAndIntelligenceText,
      schema: MasterVideoVersionDraftSchema,
      modelId: input.modelId,
    });
    return result.data;
  }
}
