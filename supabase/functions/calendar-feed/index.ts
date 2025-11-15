import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/calendar; charset=utf-8',
  'Content-Disposition': 'inline; filename="special-olympics-calendar.ics"',
};

function formatICalDate(date: string, time?: string): string {
  const d = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    d.setHours(parseInt(hours), parseInt(minutes), 0);
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: events, error } = await supabaseClient
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;

    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Special Olympics//Events Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Special Olympics Events',
      'X-WR-TIMEZONE:America/New_York',
      'X-WR-CALDESC:Special Olympics Events and Activities',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      'X-PUBLISHED-TTL:PT1H',
    ];

    for (const event of events || []) {
      const dtstart = formatICalDate(event.event_date, event.start_time);
      const dtend = event.end_time 
        ? formatICalDate(event.event_date, event.end_time)
        : formatICalDate(event.event_date, event.start_time);
      
      const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@specialolympics.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICalText(event.title)}`,
      );

      if (event.description) {
        icalContent.push(`DESCRIPTION:${escapeICalText(event.description)}`);
      }

      if (event.location) {
        icalContent.push(`LOCATION:${escapeICalText(event.location)}`);
      }

      if (event.event_type) {
        icalContent.push(`CATEGORIES:${escapeICalText(event.event_type)}`);
      }

      icalContent.push('END:VEVENT');
    }

    icalContent.push('END:VCALENDAR');

    return new Response(icalContent.join('\r\n'), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
