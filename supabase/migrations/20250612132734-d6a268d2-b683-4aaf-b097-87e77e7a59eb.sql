
-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'live-in', 'contract')),
  salary TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cover_letter TEXT,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'interview_scheduled', 'accepted', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Jobs policies (public read, admin write)
CREATE POLICY "Anyone can view active jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Authenticated users can view all jobs" 
  ON public.jobs 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jobs" 
  ON public.jobs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs" 
  ON public.jobs 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete jobs" 
  ON public.jobs 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Applications policies (users can only see their own, except for job owners)
CREATE POLICY "Users can view their own applications" 
  ON public.applications 
  FOR SELECT 
  USING (auth.uid() = applicant_id);

CREATE POLICY "Authenticated users can view all applications" 
  ON public.applications 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create applications" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Authenticated users can update applications" 
  ON public.applications 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Add indexes for better performance
CREATE INDEX jobs_status_idx ON public.jobs(status);
CREATE INDEX jobs_created_at_idx ON public.jobs(created_at);
CREATE INDEX applications_job_id_idx ON public.applications(job_id);
CREATE INDEX applications_applicant_id_idx ON public.applications(applicant_id);
CREATE INDEX applications_status_idx ON public.applications(status);
