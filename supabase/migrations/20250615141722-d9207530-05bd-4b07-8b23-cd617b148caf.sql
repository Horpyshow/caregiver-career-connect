
-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update jobs policies to require admin role
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON public.jobs;

CREATE POLICY "Only admins can insert jobs"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update jobs"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete jobs"
  ON public.jobs
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update applications policies to require admin role for management
DROP POLICY IF EXISTS "Authenticated users can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON public.applications;

CREATE POLICY "Admins can view all applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to automatically assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger to assign default user role on signup
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add index for better performance
CREATE INDEX user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX user_roles_role_idx ON public.user_roles(role);
