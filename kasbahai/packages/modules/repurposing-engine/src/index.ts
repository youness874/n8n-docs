import type { AiGateway } from '@kasbahai/ai-gateway';
import {
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  RepurposingBundleDraftSchema,
  SYSTEM_PROMPT,
} from './schema';
import type { RepurposingBundleDraft } from './schema';

export {
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  RepurposingBundleDraftSchema,
  SYSTEM_PROMPT,
} from './schema';
export type {
  CarouselDraft,
  RepurposingBundleDraft,
  ShortVideoDraft,
  SocialPostDraft,
} from './schema';

export interface RepurposingEngineInput {
  /** JSON-serialized approved MasterVideoVersion content. */
  approvedMasterVideoText: string;
  modelId?: string;
}

/**
 * Module 5. Generates shorts, carousels, and social posts strictly from an
 * approved Master Video — the only entry point downstream content is
 * allowed to be generated from.
 */
export interface RepurposingEngine {
  repurpose(input: RepurposingEngineInput): Promise<RepurposingBundleDraft>;
}

export class DefaultRepurposingEngine implements RepurposingEngine {
  constructor(private readonly gateway: AiGateway) {}

  async repurpose(input: RepurposingEngineInput): Promise<RepurposingBundleDraft> {
    const result = await this.gateway.generateStructured({
      promptVersion: PROMPT_VERSION,
      schemaVersion: OUTPUT_SCHEMA_VERSION,
      systemPrompt: SYSTEM_PROMPT,
      input: input.approvedMasterVideoText,
      schema: RepurposingBundleDraftSchema,
      modelId: input.modelId,
    });
    return result.data;
  }
}
