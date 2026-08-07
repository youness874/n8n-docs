import type { AiGateway } from '@kasbahai/ai-gateway';
import {
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  VideoConceptDraftListSchema,
} from './schema';
import type { VideoConceptDraft } from './schema';

export {
  OUTPUT_SCHEMA_VERSION,
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  VideoConceptDraftListSchema,
  VideoConceptDraftSchema,
} from './schema';
export type { VideoConceptDraft, VideoConceptDraftList } from './schema';

export interface VideoStrategistInput {
  /** JSON-serialized Source Intelligence Map content. */
  intelligenceMapText: string;
  modelId?: string;
}

/**
 * Module 3. Develops several original angles from the Source Intelligence
 * Map ("Reinvent" step) for the user (or KasbahAI) to select from before
 * any video is written.
 */
export interface VideoStrategist {
  proposeAngles(input: VideoStrategistInput): Promise<VideoConceptDraft[]>;
}

export class DefaultVideoStrategist implements VideoStrategist {
  constructor(private readonly gateway: AiGateway) {}

  async proposeAngles(input: VideoStrategistInput): Promise<VideoConceptDraft[]> {
    const result = await this.gateway.generateStructured({
      promptVersion: PROMPT_VERSION,
      schemaVersion: OUTPUT_SCHEMA_VERSION,
      systemPrompt: SYSTEM_PROMPT,
      input: input.intelligenceMapText,
      schema: VideoConceptDraftListSchema,
      modelId: input.modelId,
    });
    return result.data.concepts;
  }
}
