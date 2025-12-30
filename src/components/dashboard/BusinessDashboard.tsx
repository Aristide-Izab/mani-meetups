import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Store, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import MessageDialog from "@/components/messaging/MessageDialog";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  malls: {
    name: string;
    location: string;
  };
}

interface CustomerContact {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  unread_count: number;
}

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    fetchBusinessAndBookings();
  }, []);

  const fetchBusinessAndBookings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setCurrentUserId(user.id);

    // Fetch business
    const { data: businessData } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (businessData) {
      setBusiness(businessData);

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          malls (
            name,
            location
          )
        `)
        .eq("business_id", businessData.id)
        .order("created_at", { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData as unknown as Booking[]);
      }
    }

    // Fetch customer contacts (people who messaged this business)
    fetchCustomerContacts(user.id);
  };

  const fetchCustomerContacts = async (userId: string) => {
    // Get all messages where the business owner is involved
    const { data: messages } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, read")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (!messages || messages.length === 0) {
      setCustomerContacts([]);
      return;
    }

    // Get unique customer IDs who have contacted the business
    const customerIds = new Set<string>();
    messages.forEach((msg) => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      customerIds.add(otherId);
    });

    // Get customer profiles with phone
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", Array.from(customerIds))
      .eq("user_type", "customer");

    if (profiles) {
      const contacts = profiles.map((profile) => {
        const unreadCount = messages.filter(
          (m) => m.sender_id === profile.id && m.receiver_id === userId && !m.read
        ).length;
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          unread_count: unreadCount,
        };
      });
      setCustomerContacts(contacts);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update booking");
    } else {
      toast.success(`Booking ${status}`);
      fetchBusinessAndBookings();
    }
  };

  const handleOpenCustomerChat = (customer: CustomerContact) => {
    setSelectedCustomer({ id: customer.id, name: customer.full_name });
    setMessageDialogOpen(true);
  };

  const totalUnread = customerContacts.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
          Business Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your bookings and connect with customers
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card 
          className="shadow-elegant cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/my-business")}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">My Business</h3>
              <p className="text-sm text-muted-foreground">
                {business?.business_name || "Not set up"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bookings</h3>
              <p className="text-sm text-muted-foreground">{bookings.length} requests</p>
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
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">Messages</h3>
              <p className="text-sm text-muted-foreground">
                {customerContacts.length} customer{customerContacts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showMessages && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Customer Messages</CardTitle>
            <CardDescription>Customers who have contacted you</CardDescription>
          </CardHeader>
          <CardContent>
            {customerContacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No customer messages yet
              </p>
            ) : (
              <div className="space-y-3">
                {customerContacts.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => handleOpenCustomerChat(customer)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{customer.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.unread_count > 0 && (
                        <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {customer.unread_count}
                        </span>
                      )}
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
          <CardDescription>Manage customer appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{booking.customer_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{booking.customer_email}</span>
                        </div>
                        {booking.customer_phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{booking.customer_phone}</span>
                          </div>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Location:</span> {booking.malls.name},{" "}
                          {booking.malls.location}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Date & Time:</span> {booking.booking_date}{" "}
                          at {booking.booking_time}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={(open) => {
            setMessageDialogOpen(open);
            if (!open) {
              fetchCustomerContacts(currentUserId);
            }
          }}
          recipientId={selectedCustomer.id}
          recipientName={selectedCustomer.name}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;
