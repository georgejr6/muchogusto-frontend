// Small helpers shared by the v2 member pages.

export const normStatus = (s) => {
  if (s === 'interested') return 'accepted';
  if (s === 'not_interested') return 'declined';
  return s || 'pending';
};

export const eventStart = (inv) => {
  if (!inv?.event_date) return null;
  const d = new Date(inv.event_date);
  if (inv.event_time && /^\d{1,2}:\d{2}/.test(inv.event_time)) {
    const [h, m] = inv.event_time.split(':').map(Number);
    d.setUTCHours(h, m, 0, 0); // event times are stored as typed, in UTC, so everyone reads the same clock time
  }
  return d;
};

export const isPast = (inv) => {
  const d = eventStart(inv);
  return d ? d.getTime() < Date.now() - 6 * 3600 * 1000 : false;
};

export const fmtDay = (date, lang = 'en') =>
  date ? new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(date)) : '';

export const fmtShort = (date, lang = 'en') =>
  date ? new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(date)) : '';

export const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || '')}`;

const pad = (n) => String(n).padStart(2, '0');
// Floating local time (no Z): the calendar shows the clock time the host typed, in the guest's own zone.
const icsStamp = (d, z = '') =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00${z}`;
const icsEscape = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

// Generates and downloads an .ics file client-side.
export function downloadIcs(inv) {
  const start = eventStart(inv);
  if (!start) return;
  const end = new Date(start.getTime() + 4 * 3600 * 1000);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mucho Gusto Xo//EN', 'BEGIN:VEVENT',
    `UID:${inv.id}@muchogusto`,
    `DTSTAMP:${icsStamp(new Date(), 'Z')}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(inv.event_name)}`,
    `LOCATION:${icsEscape(inv.event_location)}`,
    `DESCRIPTION:${icsEscape(inv.dress_code ? `Dress code: ${inv.dress_code}` : '')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(inv.event_name || 'event').replace(/[^a-z0-9]+/gi, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Promise wrapper around geolocation. Rejects on denial/unavailable.
export const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(e),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
