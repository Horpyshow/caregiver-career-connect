
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Download, Edit, Trash2, Users, Briefcase, Clock, LogOut, Building2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  status: string;
  created_at: string;
}

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string | null;
  experience: string | null;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    requirements: ''
  });

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    },
  });

  // Fetch applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            title
          )
        `)
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: typeof newJob) => {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          type: jobData.type,
          salary: jobData.salary,
          description: jobData.description,
          requirements: jobData.requirements,
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setNewJob({
        title: '',
        company: '',
        location: '',
        type: '',
        salary: '',
        description: '',
        requirements: ''
      });
      setIsCreatingJob(false);
      toast({
        title: "Job Created",
        description: "New job posting has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Deleted",
        description: "Job posting has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    },
  });

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    pendingReview: applications.filter(app => app.status === 'under_review').length
  };

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.type || !newJob.salary || !newJob.description || !newJob.requirements) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate(newJob);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'Under Review';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const downloadApplicationData = () => {
    const csvContent = [
      ['Applicant Name', 'Job Title', 'Email', 'Phone', 'Experience', 'Status', 'Applied Date'],
      ...applications.map(app => [
        app.full_name,
        app.jobs.title,
        app.email,
        app.phone,
        app.experience || '',
        getStatusText(app.status),
        new Date(app.applied_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to access the admin dashboard.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => navigate('/jobs')} className="w-full">
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CareConnect Admin</h1>
                <p className="text-sm text-muted-foreground">Management Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                View Jobs
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage job postings and applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pendingReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Job Postings</h2>
              <Button onClick={() => setIsCreatingJob(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </div>

            {isCreatingJob && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Job</CardTitle>
                  <CardDescription>Fill in the details for the new job posting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        value={newJob.title}
                        onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Home Health Aide"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g., CompassCare Services"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., New York, NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary *</Label>
                      <Input
                        id="salary"
                        value={newJob.salary}
                        onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                        placeholder="e.g., $18-22/hour"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Job Type *</Label>
                      <Select value={newJob.type} onValueChange={(value) => setNewJob(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="live-in">Live-in</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the job responsibilities and requirements..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements *</Label>
                    <Textarea
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="List the job requirements (one per line)..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateJob}
                      disabled={createJobMutation.isPending}
                    >
                      {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingJob(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                {jobsLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Loading jobs...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={deleteJobMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Job Applications</h2>
              <Button onClick={downloadApplicationData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {applicationsLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Loading applications...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Job Applied</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{application.full_name}</p>
                              <p className="text-sm text-muted-foreground">{application.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{application.jobs.title}</TableCell>
                          <TableCell>{new Date(application.applied_at).toLocaleDateString()}</TableCell>
                          <TableCell>{application.experience || 'Not specified'}</TableCell>
                          <TableCell>
                            <Select
                              value={application.status}
                              onValueChange={(status) => 
                                updateApplicationMutation.mutate({ 
                                  applicationId: application.id, 
                                  status 
                                })
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Analytics charts and reports would be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
