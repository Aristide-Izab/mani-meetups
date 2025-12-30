import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MessageSquare, Phone, Mail, User } from "lucide-react";
import MessageDialog from "@/components/messaging/MessageDialog";

interface Business {
  id: string;
  business_name: string;
  description: string;
  owner_id: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

const BusinessProfile = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    if (businessId) {
      fetchBusiness();
      fetchGallery();
    }
  }, [businessId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchBusiness = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        description,
        owner_id,
        profiles!inner (
          full_name,
          email,
          phone
        )
      `)
      .eq("id", businessId)
      .single();

    if (data) {
      setBusiness(data as unknown as Business);
    }
    setLoading(false);
  };

  const fetchGallery = async () => {
    const { data } = await supabase
      .from("business_gallery")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (data) {
      setGallery(data);
    }
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

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center">Business not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Business Header */}
        <Card className="shadow-elegant mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="h-24 w-24 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
                  {business.business_name}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {business.description || "Professional nail services"}
                </p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Owner: {business.profiles.full_name}</span>
                  </div>
                  {business.profiles.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${business.profiles.phone}`} className="hover:text-primary">
                        {business.profiles.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${business.profiles.email}`} className="hover:text-primary">
                      {business.profiles.email}
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/malls")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setMessageDialogOpen(true)}
                    disabled={!currentUserId}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          {gallery.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="py-12 text-center text-muted-foreground">
                No portfolio images yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image) => (
                <Card key={image.id} className="overflow-hidden shadow-elegant group">
                  <div className="aspect-square relative">
                    <img
                      src={image.image_url}
                      alt={image.caption || "Nail work"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm">{image.caption}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Message Dialog */}
        {business && currentUserId && (
          <MessageDialog
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
            recipientId={business.owner_id}
            recipientName={business.business_name}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
