import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Business {
  id: string;
  business_name: string;
  description: string;
  owner_id: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

const MyBusiness = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (data) {
      setBusiness(data);
      setBusinessName(data.business_name);
      setDescription(data.description || "");
      fetchGallery(data.id);
    }
    setLoading(false);
  };

  const fetchGallery = async (businessId: string) => {
    const { data } = await supabase
      .from("business_gallery")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (data) {
      setGallery(data);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business-gallery")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("business-gallery")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("business_gallery")
        .insert({
          business_id: business.id,
          image_url: publicUrl,
          caption: caption || null,
        });

      if (insertError) throw insertError;

      toast.success("Image uploaded successfully!");
      setCaption("");
      fetchGallery(business.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!business) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/business-gallery/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("business-gallery").remove([filePath]);
      }

      const { error } = await supabase
        .from("business_gallery")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      toast.success("Image deleted");
      fetchGallery(business.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image");
    }
  };

  const handleSaveBusiness = async () => {
    if (!business) return;

    setSaving(true);
    const { error } = await supabase
      .from("businesses")
      .update({
        business_name: businessName,
        description: description,
      })
      .eq("id", business.id);

    if (error) {
      toast.error("Failed to update business");
    } else {
      toast.success("Business updated!");
      setBusiness({ ...business, business_name: businessName, description });
      setEditingBusiness(false);
    }
    setSaving(false);
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
          <div className="text-center">No business found</div>
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
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Business Info */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle>My Business</CardTitle>
            <CardDescription>Manage your business profile</CardDescription>
          </CardHeader>
          <CardContent>
            {editingBusiness ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Business Name</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your services..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveBusiness} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingBusiness(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-2">{business.business_name}</h3>
                <p className="text-muted-foreground mb-4">
                  {business.description || "No description yet"}
                </p>
                <Button variant="outline" onClick={() => setEditingBusiness(true)}>
                  Edit Business Info
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle>Add to Portfolio</CardTitle>
            <CardDescription>Upload images of your nail work to attract customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Caption (optional)</label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe this nail design..."
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Portfolio ({gallery.length})</h2>
          {gallery.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="py-12 text-center">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No images yet. Upload your first nail design to start attracting customers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image) => (
                <Card key={image.id} className="overflow-hidden shadow-elegant group relative">
                  <div className="aspect-square relative">
                    <img
                      src={image.image_url}
                      alt={image.caption || "Nail work"}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.id, image.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
      </div>
    </div>
  );
};

export default MyBusiness;
