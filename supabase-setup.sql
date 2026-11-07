-- ============================================================================
-- THE EXCELLENCE ACADEMY - SUPABASE DATABASE SETUP SCRIPT
-- Project: excellenceacademy.study@gmail.com's Project (ID: rzyxfifmkmhbiyegyvpj)
-- Target Table: demo_bookings
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/rzyxfifmkmhbiyegyvpj
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "Run" (or Ctrl/Cmd + Enter)
-- ============================================================================

-- 1. Create the demo_bookings table
CREATE TABLE IF NOT EXISTS public.demo_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    course TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'Website Demo Booking',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    admin_notes TEXT
);

-- 2. Add comment on table
COMMENT ON TABLE public.demo_bookings IS 'Stores demo class bookings and admissions inquiries from The Excellence Academy website';

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_demo_bookings_created_at ON public.demo_bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_phone ON public.demo_bookings (phone);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON public.demo_bookings (status);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_course ON public.demo_bookings (course);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts upon re-running)
DROP POLICY IF EXISTS "Allow anonymous insert for demo bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Allow read access to demo bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Allow update access to demo bookings" ON public.demo_bookings;
DROP POLICY IF EXISTS "Allow delete access to demo bookings" ON public.demo_bookings;

-- 6. Create RLS Policies
-- A. Allow anyone (including anonymous website visitors) to submit inquiries
CREATE POLICY "Allow anonymous insert for demo bookings"
ON public.demo_bookings
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- B. Allow read access for Admin Panel and API
CREATE POLICY "Allow read access to demo bookings"
ON public.demo_bookings
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- C. Allow update access for Admin Panel (status, notes)
CREATE POLICY "Allow update access to demo bookings"
ON public.demo_bookings
FOR UPDATE
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- D. Allow delete access for Admin Panel
CREATE POLICY "Allow delete access to demo bookings"
ON public.demo_bookings
FOR DELETE
TO anon, authenticated, service_role
USING (true);

-- 7. Grant permissions to anon, authenticated, and service_role
GRANT ALL ON public.demo_bookings TO anon;
GRANT ALL ON public.demo_bookings TO authenticated;
GRANT ALL ON public.demo_bookings TO service_role;

-- 8. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_demo_bookings_updated_at ON public.demo_bookings;
CREATE TRIGGER set_demo_bookings_updated_at
BEFORE UPDATE ON public.demo_bookings
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- 9. Insert sample records so your admin panel and database have initial data to display
INSERT INTO public.demo_bookings (name, phone, course, source, notes, status)
VALUES 
    ('Aarav Mehta', '9825012345', 'Class 11-12 Science (JEE/NEET)', 'Modal: Book a Free Demo Class', 'Interested in JEE Main weekend batches', 'New'),
    ('Pooja Prajapati', '9712098765', 'UPSC Civil Services', 'Hero Quick Form', 'Looking for 1-Year UPSC Foundation batch in Gandhinagar', 'Contacted'),
    ('Dhruv Patel', '9624041122', 'Class 8-10 Foundation', 'Main Contact Form', 'Wants GSEB Class 10 Maths & Science coaching', 'Demo Scheduled')
ON CONFLICT DO NOTHING;

-- 10. Verify table creation
SELECT 
    'SUCCESS: demo_bookings table created successfully!' AS message,
    COUNT(*) AS total_sample_records
FROM public.demo_bookings;
