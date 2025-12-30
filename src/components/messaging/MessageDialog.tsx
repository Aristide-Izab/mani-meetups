import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Phone, Mail, User, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

interface RecipientInfo {
  full_name: string;
  email: string;
  phone: string | null;
}

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  currentUserId: string;
}

const MessageDialog = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  currentUserId,
}: MessageDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && recipientId) {
      fetchMessages();
      fetchRecipientInfo();
      markMessagesAsRead();
    }
  }, [open, recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRecipientInfo = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", recipientId)
      .single();

    if (data) {
      setRecipientInfo(data);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", recipientId)
      .eq("receiver_id", currentUserId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: recipientId,
      message: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
      fetchMessages();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {recipientName}
          </DialogTitle>
        </DialogHeader>

        {/* Contact Info Toggle */}
        <div className="border-b border-border pb-3">
          <button
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Contact Information</span>
            {showContactInfo ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showContactInfo && recipientInfo && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{recipientInfo.full_name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${recipientInfo.email}`} className="hover:text-primary">
                  {recipientInfo.email}
                </a>
              </div>
              {recipientInfo.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${recipientInfo.phone}`} className="hover:text-primary">
                    {recipientInfo.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[300px] pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
