import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Business {
  id: string;
  business_name: string;
  description: string;
  profiles: {
    full_name: string;
  };
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        description,
        profiles!inner (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setBusinesses(data as unknown as Business[]);
    }
  };

  const filteredBusinesses = businesses.filter((business) =>
    business.business_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
          Customer Dashboard
        </h1>
        <p className="text-muted-foreground">Find and book with nail tech businesses</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-elegant cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/malls")}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Mall</h3>
              <p className="text-sm text-muted-foreground">Select your preferred mall location</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
              <p className="text-sm text-muted-foreground">View your appointments</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Messages</h3>
              <p className="text-sm text-muted-foreground">Chat with businesses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Browse Nail Tech Businesses</CardTitle>
          <CardDescription>Find the perfect nail tech for your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="search"
            placeholder="Search businesses..."
            className="w-full mb-6 px-4 py-2 border border-border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{business.business_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Owner: {business.profiles.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {business.description || "Professional nail services"}
                  </p>
                  <Button className="w-full" size="sm">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
