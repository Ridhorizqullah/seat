-- EventSeats: Final Seating System SQL Setup
-- Run this in your Supabase SQL Editor

-- 1. Create Seats Table (if not exists)
CREATE TABLE IF NOT EXISTS "public"."seats" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "show_id" TEXT NOT NULL REFERENCES "public"."shows"("id") ON DELETE CASCADE,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "seat_number" TEXT NOT NULL,
    "status" TEXT DEFAULT 'available',
    "category" TEXT DEFAULT 'Reguler',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Hardening: Add missing columns and fix types for existing table
DO $$ 
BEGIN 
    -- show_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'show_id') THEN
        ALTER TABLE "public"."seats" ADD COLUMN "show_id" TEXT REFERENCES "public"."shows"("id") ON DELETE CASCADE;
    ELSE
        ALTER TABLE "public"."seats" ALTER COLUMN "show_id" TYPE TEXT;
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'status') THEN
        ALTER TABLE "public"."seats" ADD COLUMN "status" TEXT DEFAULT 'available';
    END IF;

    -- seat_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'seat_number') THEN
        ALTER TABLE "public"."seats" ADD COLUMN "seat_number" TEXT;
    END IF;

    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'category') THEN
        ALTER TABLE "public"."seats" ADD COLUMN "category" TEXT DEFAULT 'Reguler';
    END IF;

    -- Ensure foreign key constraint exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'seats_show_id_fkey') THEN
        ALTER TABLE "public"."seats" ADD CONSTRAINT seats_show_id_fkey FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Add foreign key to booking_items if not exists
-- ALTER TABLE "public"."booking_items" ADD COLUMN IF NOT EXISTS "seatId" UUID REFERENCES "public"."seats"("id");

-- 3. Enable RLS
ALTER TABLE "public"."seats" ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Public seats are viewable by everyone" ON "public"."seats";
CREATE POLICY "Public seats are viewable by everyone" ON "public"."seats"
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all seats" ON "public"."seats";
CREATE POLICY "Admins can manage all seats" ON "public"."seats"
FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 5. Atomic Booking RPC Function
CREATE OR REPLACE FUNCTION "public"."book_seats"(
    p_performance_id TEXT,
    p_show_id TEXT,
    p_customer_id TEXT,
    p_seat_ids UUID[],
    p_total_amount DECIMAL,
    p_booking_number TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking_id UUID;
    v_seat_id UUID;
BEGIN
    -- Check availability
    IF EXISTS (
        SELECT 1 FROM "public"."seats" 
        WHERE id = ANY(p_seat_ids) AND status != 'available'
    ) THEN
        RAISE EXCEPTION 'One or more seats are already booked';
    END IF;

    -- Create booking
    INSERT INTO "public"."bookings" (
        bookingNumber,
        totalAmount,
        status,
        customerId,
        showId,
        performanceId,
        createdAt,
        updatedAt
    ) VALUES (
        p_booking_number,
        p_total_amount,
        'PAID',
        p_customer_id,
        p_show_id,
        p_performance_id,
        now(),
        now()
    ) RETURNING id INTO v_booking_id;

    -- Create items and update seats
    FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
        INSERT INTO "public"."booking_items" (
            bookingId,
            seatId,
            price,
            createdAt
        ) VALUES (
            v_booking_id,
            v_seat_id,
            p_total_amount / array_length(p_seat_ids, 1),
            now()
        );

        UPDATE "public"."seats" SET status = 'booked' WHERE id = v_seat_id;
    END LOOP;

    RETURN v_booking_id;
END;
$$;

-- 6. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
