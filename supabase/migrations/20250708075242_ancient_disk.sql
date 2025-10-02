/*
  # Create notes table for EduBuddy

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `title` (text, note title)
      - `description` (text, note description)
      - `file_url` (text, public URL to the file)
      - `file_path` (text, storage path for the file)
      - `uploaded_by` (text, name of uploader)
      - `subject` (text, subject name)
      - `year` (text, academic year)
      - `semester` (text, semester)
      - `category` (text, note category)
      - `upload_date` (timestamptz, when uploaded)

  2. Security
    - Enable RLS on `notes` table
    - Add policy for anyone to read notes (public access)
    - Add policy for anyone to insert notes (public upload)
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  file_url text NOT NULL,
  file_path text NOT NULL,
  uploaded_by text NOT NULL,
  subject text NOT NULL,
  year text NOT NULL,
  semester text NOT NULL,
  category text NOT NULL,
  upload_date timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read notes (public access)
CREATE POLICY "Anyone can read notes"
  ON notes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert notes (public upload)
CREATE POLICY "Anyone can upload notes"
  ON notes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS notes_search_idx ON notes USING gin (
  to_tsvector('english', title || ' ' || description || ' ' || subject || ' ' || category)
);

CREATE INDEX IF NOT EXISTS notes_year_semester_idx ON notes (year, semester);
CREATE INDEX IF NOT EXISTS notes_subject_idx ON notes (subject);
CREATE INDEX IF NOT EXISTS notes_upload_date_idx ON notes (upload_date DESC);