
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, FileText, Download, Eye, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ApplicationModal } from '@/components/ApplicationModal';
import { useQuery } from '@tanstack/react-query';

interface UserApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string | null;
  experience: string | null;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    company: string;
    location: string;
    salary: string;
  };
}

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<UserApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Fetch user applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['user-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            title,
            company,
            location,
            salary
          )
        `)
        .eq('applicant_id', user.id)
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      return data as UserApplication[];
    },
    enabled: !!user,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
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
        return 'Not Selected';
      default:
        return 'Unknown';
    }
  };

  const downloadApplicationData = (application: UserApplication) => {
    const data = {
      applicant: {
        name: application.full_name,
        email: application.email,
        phone: application.phone,
      },
      job: {
        title: application.jobs.title,
        company: application.jobs.company,
        location: application.jobs.location,
        salary: application.jobs.salary,
      },
      application: {
        coverLetter: application.cover_letter,
        experience: application.experience,
        status: getStatusText(application.status),
        appliedDate: new Date(application.applied_at).toLocaleDateString(),
      },
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `my-application-${application.jobs.title}-${application.jobs.company}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const viewApplication = (application: UserApplication) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  if (loading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Applications</h2>
              <Button onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            </div>

            {applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                  <Button onClick={() => navigate('/jobs')}>
                    Start Applying
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{application.jobs.title}</CardTitle>
                          <CardDescription className="text-lg font-medium text-primary">
                            {application.jobs.company}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.jobs.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied: {new Date(application.applied_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Salary: {application.jobs.salary}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Application
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadApplicationData(application)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">
                      {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('') : user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{profile?.full_name || 'User'}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Phone:</span> {profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Member since:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                      <p><span className="font-medium">Email verified:</span> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Email Preferences</Button>
                <Button variant="outline">Privacy Settings</Button>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
