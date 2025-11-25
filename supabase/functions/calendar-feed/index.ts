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
      'BEGIN:VTIMEZONE',
      'TZID:America/New_York',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'TZNAME:EDT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'TZNAME:EST',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
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
        // Timed event with timezone
        const startDate = new Date(event.event_date + 'T' + event.start_time);
        const startFormatted = `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}T${String(startDate.getHours()).padStart(2, '0')}${String(startDate.getMinutes()).padStart(2, '0')}00`;
        
        let endFormatted: string;
        if (event.end_time) {
          const endDate = new Date(event.event_date + 'T' + event.end_time);
          endFormatted = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;
        } else {
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default
          endFormatted = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;
        }
        
        icalContent.push(
          `DTSTART;TZID=America/New_York:${startFormatted}`,
          `DTEND;TZID=America/New_York:${endFormatted}`,
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
