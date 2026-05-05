-- SQL Schema for Seat Booking System
-- Run this in Supabase SQL Editor

-- Create Table: seats
CREATE TABLE IF NOT EXISTS "public"."seats" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "show_id" TEXT NOT NULL REFERENCES "public"."shows"("id") ON DELETE CASCADE,
    "seat_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available', -- 'available', 'booked', 'held'
    "category" TEXT NOT NULL DEFAULT 'Reguler',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Table: booking_items
-- (Modify existing or create new)
CREATE TABLE IF NOT EXISTS "public"."booking_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL REFERENCES "public"."bookings"("id") ON DELETE CASCADE,
    "seat_id" UUID NOT NULL REFERENCES "public"."seats"("id") ON DELETE RESTRICT,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for seats
ALTER PUBLICATION supabase_realtime ADD TABLE seats;

-- Setup RLS (Example)
ALTER TABLE "public"."seats" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public seats are viewable by everyone" 
ON "public"."seats" FOR SELECT 
USING (true);

CREATE POLICY "Seats can be updated by admin" 
ON "public"."seats" FOR UPDATE 
USING (auth.jwt()->>'role' IN ('ADMIN', 'STAFF'));
