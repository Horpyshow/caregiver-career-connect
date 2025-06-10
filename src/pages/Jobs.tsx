
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample job data - would come from Supabase
const sampleJobs = [
  {
    id: 1,
    title: "Home Health Aide",
    company: "CompassCare Services",
    location: "New York, NY",
    type: "Full-time",
    salary: "$18-22/hour",
    description: "Provide personal care and companionship to elderly clients in their homes.",
    requirements: ["CNA certification preferred", "1+ years experience", "Reliable transportation"],
    posted: "2 days ago"
  },
  {
    id: 2,
    title: "Certified Nursing Assistant",
    company: "Sunrise Senior Living",
    location: "Los Angeles, CA",
    type: "Part-time",
    salary: "$16-20/hour",
    description: "Assist residents with daily activities and basic medical care in assisted living facility.",
    requirements: ["CNA license required", "CPR certification", "Compassionate nature"],
    posted: "1 week ago"
  },
  {
    id: 3,
    title: "Live-in Caregiver",
    company: "Family First Care",
    location: "Chicago, IL",
    type: "Live-in",
    salary: "$3000-4000/month",
    description: "Provide 24/7 care for elderly client with dementia in their home.",
    requirements: ["Experience with dementia care", "Background check", "References required"],
    posted: "3 days ago"
  },
  {
    id: 4,
    title: "Personal Care Assistant",
    company: "Helping Hands Agency",
    location: "Houston, TX",
    type: "Full-time",
    salary: "$15-18/hour",
    description: "Assist clients with personal hygiene, medication reminders, and light housekeeping.",
    requirements: ["High school diploma", "Caring personality", "Flexible schedule"],
    posted: "5 days ago"
  }
];

const Jobs = () => {
  const [jobs, setJobs] = useState(sampleJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('posted');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const navigate = useNavigate();

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || job.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const handleJobClick = (jobId: number) => {
    // Would check if user is authenticated, if not redirect to login
    navigate(`/apply/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Caregiver Jobs</h1>
          <p className="text-muted-foreground text-lg">Find rewarding opportunities to make a difference in people's lives</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="live-in">Live-in</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">Recently Posted</SelectItem>
                <SelectItem value="title">Job Title</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6 mb-8">
          {paginatedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobClick(job.id)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-primary">{job.company}</CardDescription>
                  </div>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.posted}
                  </div>
                </div>
                <p className="text-foreground mb-4">{job.description}</p>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full md:w-auto">Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
