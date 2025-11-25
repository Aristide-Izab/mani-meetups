import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Store } from "lucide-react";
import { toast } from "sonner";

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

const BusinessDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    fetchBusinessAndBookings();
  }, []);

  const fetchBusinessAndBookings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

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
        <Card className="shadow-elegant">
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

        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Messages</h3>
              <p className="text-sm text-muted-foreground">Chat with customers</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                        <h3 className="font-semibold">{booking.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
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
    </div>
  );
};

export default BusinessDashboard;
