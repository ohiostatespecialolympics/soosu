import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Copy, Check, ExternalLink, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CALENDAR_FEED_URL = 'https://rkhnnzqwigqvlmyxaqpl.supabase.co/functions/v1/calendar-feed';
const WEBCAL_URL = 'webcal://rkhnnzqwigqvlmyxaqpl.supabase.co/functions/v1/calendar-feed';

const CalendarSubscriptionDialog = ({ open, onOpenChange }: CalendarSubscriptionDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(CALENDAR_FEED_URL);
      setCopied(true);
      toast({
        title: "URL Copied!",
        description: "Calendar URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually select and copy the URL.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleCalendar = () => {
    // Google Calendar requires adding by URL manually for live subscriptions
    window.open(`https://calendar.google.com/calendar/u/0/r/settings/addbyurl`, '_blank');
    toast({
      title: "Google Calendar Opened",
      description: "Paste the copied URL to subscribe to our calendar.",
    });
  };

  const handleAppleCalendar = () => {
    // Try webcal protocol first
    window.location.href = WEBCAL_URL;
  };

  const handleOutlookPersonal = () => {
    window.open(`https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(CALENDAR_FEED_URL)}&name=${encodeURIComponent('Special Olympics Events')}`, '_blank');
  };

  const handleOutlookWork = () => {
    window.open(`https://outlook.office.com/calendar/0/addcalendar?url=${encodeURIComponent(CALENDAR_FEED_URL)}&name=${encodeURIComponent('Special Olympics Events')}`, '_blank');
  };

  const handleDownload = () => {
    window.open(CALENDAR_FEED_URL, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-oswald text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Subscribe to Calendar
          </DialogTitle>
          <DialogDescription className="font-montserrat">
            Subscribe to our events calendar and it will automatically update as we add new events.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google" className="font-montserrat text-xs sm:text-sm">Google</TabsTrigger>
            <TabsTrigger value="apple" className="font-montserrat text-xs sm:text-sm">Apple</TabsTrigger>
            <TabsTrigger value="outlook" className="font-montserrat text-xs sm:text-sm">Outlook</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-montserrat">
                <strong>Step 1:</strong> Copy the calendar URL below
              </p>
              <div className="flex gap-2">
                <Input value={CALENDAR_FEED_URL} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground font-montserrat">
                <strong>Step 2:</strong> Click below to open Google Calendar settings
              </p>
              <Button onClick={handleGoogleCalendar} className="w-full font-montserrat gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Google Calendar
              </Button>
              <p className="text-sm text-muted-foreground font-montserrat">
                <strong>Step 3:</strong> Paste the URL in the "URL of calendar" field and click "Add calendar"
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground font-montserrat">
                Google Calendar refreshes subscriptions every 12-24 hours. New events may take time to appear.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="apple" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-montserrat">
                Click below to automatically open Apple Calendar with the subscription:
              </p>
              <Button onClick={handleAppleCalendar} className="w-full font-montserrat gap-2">
                <Calendar className="h-4 w-4" />
                Subscribe in Apple Calendar
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or manually</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-montserrat">
                <strong>Manual steps:</strong> Open Calendar app → File → New Calendar Subscription → Paste URL:
              </p>
              <div className="flex gap-2">
                <Input value={CALENDAR_FEED_URL} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="outlook" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-montserrat">
                Choose your Outlook account type:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleOutlookPersonal} variant="outline" className="font-montserrat gap-2">
                  <Calendar className="h-4 w-4" />
                  Personal (Live/Hotmail)
                </Button>
                <Button onClick={handleOutlookWork} variant="outline" className="font-montserrat gap-2">
                  <Calendar className="h-4 w-4" />
                  Work (Microsoft 365)
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or manually</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-montserrat">
                <strong>Desktop Outlook:</strong> Add Calendar → Subscribe from web → Paste URL:
              </p>
              <div className="flex gap-2">
                <Input value={CALENDAR_FEED_URL} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={handleDownload} className="w-full font-montserrat gap-2">
            <Download className="h-4 w-4" />
            Download Calendar File (.ics)
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center font-montserrat">
            Download once for a snapshot (won't auto-update)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarSubscriptionDialog;
