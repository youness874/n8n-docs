import { z } from 'zod';
import { Platform, schemaVersion, timestamps, workspaceScoped } from './common';

export const CarouselSlideSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  carouselId: z.string().uuid(),
  index: z.number().int().nonnegative(),
  headline: z.string().min(1),
  bodyText: z.string().min(1),
  visualInstruction: z.string().min(1),
  layoutRecommendation: z.string().min(1),
  imagePrompt: z.string().min(1),
  accessibilityDescription: z.string().min(1),
  ...timestamps,
});
export type CarouselSlide = z.infer<typeof CarouselSlideSchemaV1>;
export const CarouselSlideSchema = CarouselSlideSchemaV1;

/**
 * Each carousel teaches one idea end-to-end; it is not a long-form script
 * chopped into slides. Generated from an approved MasterVideo.
 */
export const CarouselSchemaV1 = z.object({
  schemaVersion: schemaVersion(1),
  ...workspaceScoped,
  masterVideoId: z.string().uuid(),
  masterVideoVersionId: z.string().uuid(),
  platform: Platform,
  title: z.string().min(1),
  slideCount: z.number().int().positive(),
  ...timestamps,
});
export type Carousel = z.infer<typeof CarouselSchemaV1>;

export const CarouselSchema = CarouselSchemaV1;
