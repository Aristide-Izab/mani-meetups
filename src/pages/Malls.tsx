import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface Mall {
  id: string;
  name: string;
  location: string;
  description: string;
}

const Malls = () => {
  const navigate = useNavigate();
  const [malls, setMalls] = useState<Mall[]>([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
      if (!session) {
        navigate("/auth");
      }
    });

    fetchMalls();
  }, [navigate]);

  const fetchMalls = async () => {
    const { data } = await supabase
      .from("malls")
      .select("*")
      .order("name");

    if (data) {
      setMalls(data);
    }
  };

  const handleMallSelect = (mallId: string) => {
    navigate(`/booking?mall=${mallId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              Choose Your Mall
            </h1>
            <p className="text-xl text-muted-foreground">
              Select where you'd like to meet your nail tech
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {malls.map((mall) => (
              <Card key={mall.id} className="shadow-elegant hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{mall.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{mall.location}</p>
                      <p className="text-sm text-muted-foreground mb-4">{mall.description}</p>
                      <Button
                        onClick={() => handleMallSelect(mall.id)}
                        className="bg-gradient-hero"
                      >
                        Select This Mall
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Malls;
