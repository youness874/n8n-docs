import { z } from 'zod';
import { schemaVersion, timestamps, workspaceScoped } from './common';

export const QualityReviewType = z.enum(['originality', 'accuracy', 'content', 'brand']);

const findingSchema = z.object({
  severity: z.enum(['info', 'warning', 'blocking']),
  message: z.string().min(1),
  relatedSceneIndex: z.number().int().nonnegative().optional(),
});

/**
 * One quality gate's verdict against a specific MasterVideoVersion. A
 * version only becomes the MasterVideo's approvedVersionId once all four
 * review types (originality, accuracy, content, brand) have passed=true.
 */
export const QualityReviewSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  masterVideoVersionId: z.string().uuid(),
  reviewType: QualityReviewType,
  passed: z.boolean(),
  findings: z.array(findingSchema).default([]),
  reviewedAt: z.coerce.date(),
  ...timestamps,
});
export type QualityReview = z.infer<typeof QualityReviewSchemaV1>;

export const QualityReviewSchema = QualityReviewSchemaV1;
