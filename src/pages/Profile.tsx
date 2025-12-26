import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Building2, Mail, Phone, FileText, Pencil, X } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  user_type: string;
}

interface Business {
  id: string;
  business_name: string;
  username: string | null;
  description: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const fetchProfileData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const user = session.user;
    const userMeta = user.user_metadata;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData) {
      // Use profile data, but fallback to user metadata if empty
      const combinedFullName = profileData.full_name || 
        `${userMeta?.first_name || ''} ${userMeta?.surname || ''}`.trim() ||
        user.email?.split('@')[0] || '';
      
      setProfile({
        ...profileData,
        full_name: combinedFullName
      });
      setFullName(combinedFullName);
      setPhone(profileData.phone || userMeta?.phone || "");

      // If business user, fetch business details
      if (profileData.user_type === "business") {
        const { data: businessData } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (businessData) {
          setBusiness(businessData);
          setBusinessName(businessData.business_name || "");
          setBusinessDescription(businessData.description || "");
        }
      }
    } else {
      // No profile found, create one from user metadata
      const combinedFullName = `${userMeta?.first_name || ''} ${userMeta?.surname || ''}`.trim();
      setProfile({
        id: user.id,
        full_name: combinedFullName,
        email: user.email || '',
        phone: userMeta?.phone || null,
        user_type: userMeta?.user_type || 'customer'
      });
      setFullName(combinedFullName);
      setPhone(userMeta?.phone || "");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
      })
      .eq("id", profile.id);

    if (profileError) {
      toast.error("Failed to update profile");
      setSaving(false);
      return;
    }

    // If business user, update business details
    if (profile.user_type === "business" && business) {
      const { error: businessError } = await supabase
        .from("businesses")
        .update({
          business_name: businessName,
          description: businessDescription || null,
        })
        .eq("id", business.id);

      if (businessError) {
        toast.error("Failed to update business details");
        setSaving(false);
        return;
      }
    }

    toast.success("Profile updated successfully!");
    setSaving(false);
    setIsEditing(false);
    fetchProfileData();
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || "");
    }
    if (business) {
      setBusinessName(business.business_name);
      setBusinessDescription(business.description || "");
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profile?.user_type === "business" ? (
                    <Building2 className="h-8 w-8 text-primary" />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                  <div>
                    <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent">
                      My Profile
                    </CardTitle>
                    <CardDescription>
                      {profile?.user_type === "business" ? "Business Account" : "Customer Account"}
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-medium">{profile?.full_name || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </span>
                      <span className="font-medium">{profile?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </span>
                      <span className="font-medium">{profile?.phone || "Not set"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Information (only for business users) */}
              {profile?.user_type === "business" && business && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Information
                  </h3>

                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="username">Business Username</Label>
                        <Input
                          id="username"
                          value={business.username || ""}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Your business name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Business Description
                        </Label>
                        <Textarea
                          id="description"
                          value={businessDescription}
                          onChange={(e) => setBusinessDescription(e.target.value)}
                          placeholder="Describe your nail tech services..."
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Username</span>
                        <span className="font-medium">@{business.username || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Business Name</span>
                        <span className="font-medium">{business.business_name}</span>
                      </div>
                      <div className="py-2">
                        <span className="text-muted-foreground flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </span>
                        <p className="text-sm">{business.description || "No description set"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-hero"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
