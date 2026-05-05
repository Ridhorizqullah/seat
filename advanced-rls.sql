-- EventSeats: Advanced RLS Policies for Multi-tenancy
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on all critical tables
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."venues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."performances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."seats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."booking_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- 2. Organizations
CREATE POLICY "Users can view their own organization" ON "public"."organizations"
FOR SELECT USING (
  id IN (SELECT "organizationId" FROM "public"."users" WHERE id = auth.uid()::text)
);

-- 3. Shows (Multi-tenant)
CREATE POLICY "Public can view published shows" ON "public"."shows"
FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Admins can manage their organization's shows" ON "public"."shows"
FOR ALL USING (
  "organizationId" IN (SELECT "organizationId" FROM "public"."users" WHERE id = auth.uid()::text)
);

-- 4. Performances
CREATE POLICY "Public can view performances of published shows" ON "public"."performances"
FOR SELECT USING (
  "showId" IN (SELECT id FROM "public"."shows" WHERE status = 'PUBLISHED')
);

CREATE POLICY "Admins can manage their organization's performances" ON "public"."performances"
FOR ALL USING (
  "showId" IN (
    SELECT id FROM "public"."shows" 
    WHERE "organizationId" IN (SELECT "organizationId" FROM "public"."users" WHERE id = auth.uid()::text)
  )
);

-- 5. Seats (Critical for Realtime)
CREATE POLICY "Seats are viewable by everyone" ON "public"."seats"
FOR SELECT USING (true);

CREATE POLICY "Admins can manage organization's seats" ON "public"."seats"
FOR ALL USING (
  "show_id" IN (
    SELECT id FROM "public"."shows" 
    WHERE "organizationId" IN (SELECT "organizationId" FROM "public"."users" WHERE id = auth.uid()::text)
  )
);

-- 6. Bookings (Privacy)
CREATE POLICY "Customers can view their own bookings" ON "public"."bookings"
FOR SELECT USING (
  "customerId" IN (SELECT id FROM "public"."customers" WHERE email = auth.jwt() ->> 'email')
);

CREATE POLICY "Admins can view organization's bookings" ON "public"."bookings"
FOR SELECT USING (
  "showId" IN (
    SELECT id FROM "public"."shows" 
    WHERE "organizationId" IN (SELECT "organizationId" FROM "public"."users" WHERE id = auth.uid()::text)
  )
);

-- 7. Notification for schema change
NOTIFY pgrst, 'reload schema';
