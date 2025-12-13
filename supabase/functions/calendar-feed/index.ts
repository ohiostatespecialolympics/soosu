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

function formatICalDate(dateStr: string, timeStr?: string): string {
  if (!timeStr) {
    return dateStr.replace(/-/g, '');
  }
  const d = new Date(`${dateStr}T${timeStr}`);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatICalTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function calculateSequence(updatedAt: string | null): number {
  if (!updatedAt) return 0;
  const updated = new Date(updatedAt);
  const epoch = new Date('2024-01-01').getTime();
  return Math.floor((updated.getTime() - epoch) / 1000);
}

serve(async (req) => {
  console.log('Calendar feed request received');
  
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

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${events?.length || 0} events`);

    const now = new Date();
    const nowFormatted = formatICalTimestamp(now);

    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Special Olympics//Events Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Special Olympics Events',
      'X-WR-TIMEZONE:America/New_York',
      'X-WR-CALDESC:Special Olympics Events and Activities',
      'REFRESH-INTERVAL;VALUE=DURATION:PT30M',
      'X-PUBLISHED-TTL:PT30M',
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
      const sequence = calculateSequence(event.updated_at);
      const lastModified = event.updated_at 
        ? formatICalTimestamp(new Date(event.updated_at))
        : nowFormatted;

      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@specialolympics.com`,
        `DTSTAMP:${nowFormatted}`,
        `SEQUENCE:${sequence}`,
        `LAST-MODIFIED:${lastModified}`,
        `SUMMARY:${escapeICalText(event.title)}`,
      );

      // All-day event (no start_time)
      if (!event.start_time) {
        const startDateOnly = event.event_date.replace(/-/g, '');
        const d = new Date(event.event_date + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() + 1);
        const endDateOnly = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;

        icalContent.push(
          `DTSTART;VALUE=DATE:${startDateOnly}`,
          `DTEND;VALUE=DATE:${endDateOnly}`,
        );
      } else {
        // Timed event with timezone
        const startFormatted = formatICalDate(event.event_date, event.start_time);
        
        let endFormatted: string;
        if (event.end_time) {
          endFormatted = formatICalDate(event.event_date, event.end_time);
        } else {
          const startDate = new Date(event.event_date + 'T' + event.start_time);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
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

    console.log('Calendar feed generated successfully');

    return new Response(icalContent.join('\r\n'), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('Error generating calendar feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});