import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import BusinessDashboard from "@/components/dashboard/BusinessDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .single();

    if (data) {
      setUserType(data.user_type);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {userType === "customer" ? <CustomerDashboard /> : <BusinessDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
