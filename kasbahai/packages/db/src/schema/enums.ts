import { pgEnum } from 'drizzle-orm/pg-core';

export const sourceTypeEnum = pgEnum('source_type', [
  'youtube_url',
  'pasted_transcript',
  'uploaded_file',
]);

export const transcriptInputFormatEnum = pgEnum('transcript_input_format', [
  'pasted',
  'txt',
  'docx',
  'srt',
  'vtt',
]);

export const transcriptStatusEnum = pgEnum('transcript_status', [
  'raw',
  'processing',
  'ready',
  'failed',
]);

export const knowledgeLevelEnum = pgEnum('knowledge_level', [
  'beginner',
  'intermediate',
  'advanced',
  'mixed',
]);

export const originalityRiskEnum = pgEnum('originality_risk', ['low', 'medium', 'high']);

export const videoAngleTypeEnum = pgEnum('video_angle_type', [
  'beginner_explanation',
  'contrarian_argument',
  'step_by_step_implementation',
  'case_study',
  'myth_vs_reality',
  'failure_analysis',
  'transformation_story',
  'comparison',
]);

export const masterVideoStatusEnum = pgEnum('master_video_status', [
  'draft',
  'in_review',
  'approved',
  'rejected',
]);

export const qualityReviewTypeEnum = pgEnum('quality_review_type', [
  'originality',
  'accuracy',
  'content',
  'brand',
]);

export const moduleNameEnum = pgEnum('module_name', [
  'source_processor',
  'intelligence_analyst',
  'video_strategist',
  'script_engine',
  'repurposing_engine',
]);

export const generationRunStatusEnum = pgEnum('generation_run_status', [
  'pending',
  'running',
  'succeeded',
  'failed',
]);

export const platformEnum = pgEnum('platform', [
  'youtube',
  'youtube_shorts',
  'tiktok',
  'instagram_reels',
  'instagram',
  'linkedin',
  'x',
  'pinterest',
]);

export const shortVideoConceptTypeEnum = pgEnum('short_video_concept_type', [
  'one_powerful_insight',
  'common_mistake',
  'mini_tutorial',
  'myth_correction',
  'strong_opinion',
  'before_and_after',
  'framework_breakdown',
  'story_moment',
  'checklist',
  'question_and_answer',
]);

export const socialPostTypeEnum = pgEnum('social_post_type', [
  'linkedin_insight',
  'linkedin_lesson',
  'instagram_caption',
  'x_single',
  'x_thread',
]);
