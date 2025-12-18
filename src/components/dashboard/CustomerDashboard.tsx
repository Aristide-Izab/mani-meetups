import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, MessageSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessageDialog from "@/components/messaging/MessageDialog";

interface Business {
  id: string;
  business_name: string;
  description: string;
  owner_id: string;
  profiles: {
    full_name: string;
  };
}

interface Conversation {
  id: string;
  business_name: string;
  owner_id: string;
  owner_name: string;
  unread_count: number;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<{
    id: string;
    name: string;
    ownerId: string;
  } | null>(null);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchBusinesses();
      fetchConversations();
    }
  }, [currentUserId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        description,
        owner_id,
        profiles!inner (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setBusinesses(data as unknown as Business[]);
    }
  };

  const fetchConversations = async () => {
    // Get all messages where current user is involved
    const { data: messages } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, read")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (!messages) return;

    // Get unique business owner IDs the customer has talked to
    const businessOwnerIds = new Set<string>();
    messages.forEach((msg) => {
      const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      businessOwnerIds.add(otherId);
    });

    // Get business info for each owner
    const { data: businessesData } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        owner_id,
        profiles!inner (full_name)
      `)
      .in("owner_id", Array.from(businessOwnerIds));

    if (businessesData) {
      const convos = businessesData.map((biz: any) => {
        const unreadCount = messages.filter(
          (m) => m.sender_id === biz.owner_id && m.receiver_id === currentUserId && !m.read
        ).length;
        return {
          id: biz.id,
          business_name: biz.business_name,
          owner_id: biz.owner_id,
          owner_name: biz.profiles.full_name,
          unread_count: unreadCount,
        };
      });
      setConversations(convos);
    }
  };

  const handleMessageBusiness = (business: Business) => {
    setSelectedBusiness({
      id: business.id,
      name: business.business_name,
      ownerId: business.owner_id,
    });
    setMessageDialogOpen(true);
  };

  const handleOpenConversation = (convo: Conversation) => {
    setSelectedBusiness({
      id: convo.id,
      name: convo.business_name,
      ownerId: convo.owner_id,
    });
    setMessageDialogOpen(true);
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
        <p className="text-muted-foreground">Find and connect with nail tech businesses</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card 
          className="shadow-elegant cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => navigate("/malls")}
        >
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

        <Card 
          className="shadow-elegant cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowMessages(!showMessages)}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4 relative">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
                {conversations.reduce((sum, c) => sum + c.unread_count, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">Messages</h3>
              <p className="text-sm text-muted-foreground">Chat with businesses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showMessages && conversations.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Your Conversations</CardTitle>
            <CardDescription>Continue chatting with businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => handleOpenConversation(convo)}
                >
                  <div>
                    <h4 className="font-medium">{convo.business_name}</h4>
                    <p className="text-sm text-muted-foreground">{convo.owner_name}</p>
                  </div>
                  {convo.unread_count > 0 && (
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Browse Nail Tech Businesses</CardTitle>
          <CardDescription>Find the perfect nail tech for your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search businesses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageBusiness(business)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBusiness && (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={(open) => {
            setMessageDialogOpen(open);
            if (!open) {
              fetchConversations();
            }
          }}
          recipientId={selectedBusiness.ownerId}
          recipientName={selectedBusiness.name}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
