
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Mail, Phone, User, Briefcase } from 'lucide-react';

interface ApplicationModalProps {
  application: {
    id: string;
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
  };
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
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

  const downloadApplication = () => {
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
    
    const exportFileDefaultName = `application-${application.full_name}-${application.jobs.title}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">Application Details</DialogTitle>
              <DialogDescription>
                Application for {application.jobs.title} at {application.jobs.company}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(application.status)}>
              {getStatusText(application.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Position:</span> {application.jobs.title}
              </div>
              <div>
                <span className="font-medium">Company:</span> {application.jobs.company}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Location:</span> {application.jobs.location}
              </div>
              <div>
                <span className="font-medium">Salary:</span> {application.jobs.salary}
              </div>
            </div>
          </div>

          <Separator />

          {/* Applicant Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Name:</span> {application.full_name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email:</span> {application.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Phone:</span> {application.phone}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Applied:</span> {new Date(application.applied_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <Separator />

          {/* Experience */}
          {application.experience && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Experience</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{application.experience}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Cover Letter</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={downloadApplication} variant="outline">
              Download Application
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
