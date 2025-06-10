
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, FileText, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample user applications data
const sampleApplications = [
  {
    id: 1,
    jobTitle: "Home Health Aide",
    company: "CompassCare Services",
    location: "New York, NY",
    appliedDate: "2024-01-15",
    status: "under_review",
    salary: "$18-22/hour"
  },
  {
    id: 2,
    jobTitle: "Certified Nursing Assistant",
    company: "Sunrise Senior Living",
    location: "Los Angeles, CA",
    appliedDate: "2024-01-12",
    status: "interview_scheduled",
    salary: "$16-20/hour",
    interviewDate: "2024-01-20"
  },
  {
    id: 3,
    jobTitle: "Personal Care Assistant",
    company: "Helping Hands Agency",
    location: "Houston, TX",
    appliedDate: "2024-01-10",
    status: "rejected",
    salary: "$15-18/hour"
  }
];

// Sample user profile data
const sampleProfile = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "(555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  experience: "3 years",
  certifications: ["CNA", "CPR", "First Aid"],
  avatar: ""
};

const UserDashboard = () => {
  const [applications, setApplications] = useState(sampleApplications);
  const [profile, setProfile] = useState(sampleProfile);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your job applications and profile</p>
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
                          <CardTitle className="text-xl">{application.jobTitle}</CardTitle>
                          <CardDescription className="text-lg font-medium text-primary">
                            {application.company}
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
                          {application.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                        {application.interviewDate && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Calendar className="h-4 w-4" />
                            Interview: {new Date(application.interviewDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Application
                        </Button>
                        <Button variant="outline" size="sm">
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
                <CardDescription>Update your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Phone:</span> {profile.phone}</p>
                      <p><span className="font-medium">Address:</span> {profile.address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Professional Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Experience:</span> {profile.experience}</p>
                      <div>
                        <span className="font-medium">Certifications:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
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
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
