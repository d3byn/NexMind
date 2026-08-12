ALTER TABLE "calendar_items" ADD COLUMN IF NOT EXISTS "is_all_day" boolean DEFAULT false NOT NULL;
