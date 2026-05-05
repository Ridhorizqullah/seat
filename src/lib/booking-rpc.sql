-- Supabase RPC Function for Atomic Booking
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION "public"."book_seats"(
    p_performance_id UUID,
    p_show_id UUID,
    p_customer_id UUID,
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
    -- 1. Check if all seats are available
    -- Note: In the simplified model, we check the 'status' in the 'seats' table.
    -- If we use the performance-based model, we would check 'booking_items'.
    -- The workflow says: "cek ketersediaan kursi di database tepat sebelum transaksi".
    
    IF EXISTS (
        SELECT 1 FROM "public"."seats" 
        WHERE id = ANY(p_seat_ids) AND status != 'available'
    ) THEN
        RAISE EXCEPTION 'One or more seats are already booked';
    END IF;

    -- 2. Create the booking
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
        'PAID', -- Or 'CONFIRMED'
        p_customer_id,
        p_show_id,
        p_performance_id,
        now(),
        now()
    ) RETURNING id INTO v_booking_id;

    -- 3. Create booking items and update seat status
    FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
        INSERT INTO "public"."booking_items" (
            bookingId,
            seatId,
            price, -- Simplified: assuming fixed price or calculated outside
            createdAt
        ) VALUES (
            v_booking_id,
            v_seat_id,
            p_total_amount / array_length(p_seat_ids, 1),
            now()
        );

        -- Update seat status to 'booked' (Simplified model)
        UPDATE "public"."seats" 
        SET status = 'booked' 
        WHERE id = v_seat_id;
    END LOOP;

    RETURN v_booking_id;
END;
$$;
