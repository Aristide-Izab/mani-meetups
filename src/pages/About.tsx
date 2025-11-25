import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              About Meet&Mani
            </h1>
            <p className="text-xl text-muted-foreground">
              Connecting beauty professionals with clients, one nail at a time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
                  <p className="text-sm text-muted-foreground">
                    To empower nail tech businesses by connecting them with customers at convenient mall locations
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    To become the leading platform for mobile beauty services across South Africa
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Our Values</h3>
                  <p className="text-sm text-muted-foreground">
                    Quality, convenience, and trust are at the heart of everything we do
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sign Up</h4>
                    <p className="text-sm text-muted-foreground">
                      Create an account as a customer or business owner
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Browse & Connect</h4>
                    <p className="text-sm text-muted-foreground">
                      Customers browse nail techs and choose their preferred mall location
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Book & Meet</h4>
                    <p className="text-sm text-muted-foreground">
                      Schedule your appointment and meet at the mall for your service
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
