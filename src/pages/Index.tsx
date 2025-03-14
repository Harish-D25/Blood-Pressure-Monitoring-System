
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Blood Pressure <span className="text-bpms-600">Monitoring</span> System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track, monitor, and analyze blood pressure readings for you and your family members in one secure location.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Track Records</CardTitle>
              <CardDescription>Easily log blood pressure readings</CardDescription>
            </CardHeader>
            <CardContent>
              Record systolic, diastolic, and pulse readings with timestamps and notes. Keep a comprehensive history of all measurements.
            </CardContent>
            <CardFooter>
              <Link to={isAuthenticated ? "/records" : "/register"} className="text-primary hover:underline">
                Get started →
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Family Management</CardTitle>
              <CardDescription>Monitor your loved ones' health</CardDescription>
            </CardHeader>
            <CardContent>
              Add family members to your account and track their blood pressure readings. Manage their health records in one place.
            </CardContent>
            <CardFooter>
              <Link to={isAuthenticated ? "/family" : "/register"} className="text-primary hover:underline">
                Learn more →
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insightful Analytics</CardTitle>
              <CardDescription>Understand your readings</CardDescription>
            </CardHeader>
            <CardContent>
              View trends, statistics, and visualizations of your blood pressure data. Get insights into your cardiovascular health.
            </CardContent>
            <CardFooter>
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="text-primary hover:underline">
                See analytics →
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="py-8">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Create Account</h3>
              <p className="text-muted-foreground">Sign up with your email and password</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Add Family Members</h3>
              <p className="text-muted-foreground">Include your loved ones in your health tracking</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Record Readings</h3>
              <p className="text-muted-foreground">Log blood pressure measurements after taking them</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">Monitor changes and identify trends over time</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-card rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Monitoring Your Health Today</h2>
          <p className="mb-6 text-muted-foreground">
            Join thousands of users who take control of their cardiovascular health with our easy-to-use blood pressure tracking system.
          </p>
          {!isAuthenticated && (
            <Button size="lg" onClick={() => navigate("/register")}>
              Create Free Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
