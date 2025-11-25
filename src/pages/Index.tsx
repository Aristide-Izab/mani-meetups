import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, MessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Welcome to Meet&Mani</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
            Connect with Nail Techs at Your Favorite Malls
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book professional nail services at convenient mall locations. Find the perfect nail tech and schedule your appointment today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-hero shadow-elegant">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Malls Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Locations</h2>
          <p className="text-muted-foreground">Choose from top mall locations across South Africa</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Sandton City", location: "Sandton, Johannesburg" },
            { name: "Mall of Africa", location: "Midrand, Johannesburg" },
            { name: "Gateway Theatre", location: "Umhlanga, Durban" },
            { name: "Canal Walk", location: "Cape Town" },
          ].map((mall, index) => (
            <Card key={index} className="shadow-elegant hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{mall.name}</h3>
                  <p className="text-sm text-muted-foreground">{mall.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Simple steps to beautiful nails</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Mall</h3>
                <p className="text-muted-foreground">
                  Select from our featured mall locations across South Africa
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Book Your Slot</h3>
                <p className="text-muted-foreground">
                  Pick a date and time that works best for your schedule
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect & Meet</h3>
                <p className="text-muted-foreground">
                  Chat with your nail tech and meet at the mall
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-hero shadow-elegant max-w-3xl mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/90 mb-6">
              Join Meet&Mani today and discover top nail tech businesses in your area
            </p>
            <Button asChild size="lg" variant="secondary" className="shadow-md">
              <Link to="/auth">Create Your Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
