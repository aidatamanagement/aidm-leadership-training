-- Create lesson_locks table
CREATE TABLE IF NOT EXISTS lesson_locks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id, lesson_id)
);

-- Add RLS policies
ALTER TABLE lesson_locks ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage lesson locks
CREATE POLICY "Admins can manage lesson locks"
    ON lesson_locks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy for users to view their own lesson locks
CREATE POLICY "Users can view their own lesson locks"
    ON lesson_locks
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_locks_user_course
    ON lesson_locks(user_id, course_id); 