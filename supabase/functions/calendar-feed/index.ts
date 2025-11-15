import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/calendar; charset=utf-8',
  'Content-Disposition': 'inline; filename="special-olympics-calendar.ics"',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
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
      const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@specialolympics.com`,
        `DTSTAMP:${now}`,
        `SUMMARY:${escapeICalText(event.title)}`,
      );

      // All-day event (no start_time)
      if (!event.start_time) {
        const startDateOnly = event.event_date.split('-').join('');
        const d = new Date(event.event_date + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() + 1);
        const endDateOnly = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;

        icalContent.push(
          `DTSTART;VALUE=DATE:${startDateOnly}`,
          `DTEND;VALUE=DATE:${endDateOnly}`,
        );
      } else {
        // Timed event
        const dtstart = formatICalDate(event.event_date, event.start_time);
        let dtend: string;
        if (event.end_time) {
          dtend = formatICalDate(event.event_date, event.end_time);
        } else {
          const d = new Date(event.event_date);
          const [h, m] = event.start_time.split(':');
          d.setHours(parseInt(h), parseInt(m), 0);
          d.setMinutes(d.getMinutes() + 60); // default to 1 hour duration if no end_time
          dtend = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
        icalContent.push(
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
        );
      }

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
