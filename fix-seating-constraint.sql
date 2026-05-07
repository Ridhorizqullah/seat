-- Fix Seating Layout Unique Constraint and Add Show-Scoped Unique Constraint
-- Run this in your Supabase SQL Editor (https://supabase.com)

-- 1. Drop the legacy unique constraint/index on seats
ALTER TABLE "public"."seats" DROP CONSTRAINT IF EXISTS "seats_seatingLayoutId_row_number_key";
DROP INDEX IF EXISTS "public"."seats_seatingLayoutId_row_number_key";

-- 2. Drop any previous temporary or duplicate indexes
DROP INDEX IF EXISTS "public"."seats_layout_row_number_null_show_idx";
DROP INDEX IF EXISTS "public"."seats_show_row_number_not_null_idx";

-- 3. Create partial unique indexes to support both layout-level seeds and show-level seats
CREATE UNIQUE INDEX "seats_layout_row_number_null_show_idx" ON "public"."seats"("seatingLayoutId", "row", "number") WHERE "show_id" IS NULL;
CREATE UNIQUE INDEX "seats_show_row_number_not_null_idx" ON "public"."seats"("show_id", "row", "number") WHERE "show_id" IS NOT NULL;

-- 4. Reload the Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT 'Database seating constraints fixed successfully!' AS status;
