import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns, workspaceIdColumn } from './columns';
import { carousels } from './carousel';

export const carouselSlides = pgTable('carousel_slides', {
  id: idColumn(),
  workspaceId: workspaceIdColumn(),
  carouselId: uuid('carousel_id')
    .notNull()
    .references(() => carousels.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  headline: text('headline').notNull(),
  bodyText: text('body_text').notNull(),
  visualInstruction: text('visual_instruction').notNull(),
  layoutRecommendation: text('layout_recommendation').notNull(),
  imagePrompt: text('image_prompt').notNull(),
  accessibilityDescription: text('accessibility_description').notNull(),
  ...timestampColumns,
});
