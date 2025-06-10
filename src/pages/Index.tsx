
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, Star } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Calling in Caregiving
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of compassionate caregivers and make a meaningful difference in people's lives. 
            Discover rewarding career opportunities in healthcare and personal care.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg">We connect caring professionals with families who need them most</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Meaningful Work</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Make a real difference in people's lives while building a rewarding career
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Supportive Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Join a network of caring professionals who support each other
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Your information is protected with industry-leading security measures
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Quality Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Access to verified, high-quality job opportunities with reputable employers
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Caregiving Journey?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Browse available positions and take the first step toward a meaningful career
          </p>
          <Button size="lg" onClick={() => navigate('/jobs')}>
            Explore Opportunities
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 CaregiverCareers. Making compassionate connections.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
