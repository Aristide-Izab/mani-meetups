import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mallId = searchParams.get("mall");

  const [mall, setMall] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mallId) {
      navigate("/malls");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    fetchMallAndBusinesses();
  }, [mallId, navigate]);

  const fetchMallAndBusinesses = async () => {
    const { data: mallData } = await supabase
      .from("malls")
      .select("*")
      .eq("id", mallId)
      .single();

    if (mallData) {
      setMall(mallData);
    }

    const { data: businessesData } = await supabase
      .from("businesses")
      .select("id, business_name, username, description, owner_id")
      .order("business_name");

    if (businessesData) {
      setBusinesses(businessesData);
    }
  };

  const handleBooking = async () => {
    if (!selectedBusiness || !selectedDate || !selectedTime) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in to book");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get the selected business details
    const selectedBusinessData = businesses.find(b => b.id === selectedBusiness);

    const { error } = await supabase.from("bookings").insert({
      customer_id: user.id,
      business_id: selectedBusiness,
      mall_id: mallId,
      booking_date: selectedDate.toISOString().split("T")[0],
      booking_time: selectedTime,
      customer_name: profile?.full_name || "",
      customer_email: profile?.email || "",
      customer_phone: profile?.phone || "",
    });

    if (error) {
      toast.error("Failed to create booking");
      setLoading(false);
      return;
    }

    // Send notification message to the business
    const formattedDate = selectedDate.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const bookingMessage = `📅 New Booking Request!\n\nCustomer: ${profile?.full_name || 'N/A'}\nEmail: ${profile?.email || 'N/A'}\nPhone: ${profile?.phone || 'N/A'}\n\nDate: ${formattedDate}\nTime: ${selectedTime}\nMall: ${mall?.name || 'N/A'}\n\nPlease confirm or decline this booking from your dashboard.`;

    const { error: messageError } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedBusinessData?.owner_id,
      message: bookingMessage,
    });

    if (messageError) {
      console.error("Failed to send notification message:", messageError);
    }

    toast.success("Booking request sent successfully!");
    navigate("/dashboard");

    setLoading(false);
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent">
                Book Your Appointment
              </CardTitle>
              <CardDescription>
                {mall?.name} - {mall?.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Nail Tech Business</Label>
                {businesses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No nail tech businesses available yet. Please check back later.
                  </p>
                ) : (
                  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.business_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleBooking}
                className="w-full bg-gradient-hero"
                disabled={loading}
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
