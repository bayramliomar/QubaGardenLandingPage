export type FloorId = "floor1" | "floor2" | "whole";

export interface CalendarConfig {
  floor1Feeds: string;
  floor2Feeds: string;
  wholeHouseFeeds: string;
}

export interface FetchAvailabilityResult {
  blockedDates: Set<string>;
  errors: string[];
}

export const AVAILABILITY_KEY = "qgr_calendar_feeds";

export const defaultCalendarConfig: CalendarConfig = {
  floor1Feeds: [
    "https://www.airbnb.com/calendar/ical/1721700918778425393.ics?t=cad1be657b534fb6b6ddea54015be911&locale=en-GB",
    "https://ical.booking.com/v1/export?t=b7514372-c30b-41e1-8317-a5aeca186515",
  ].join("\n"),
  floor2Feeds: [
    "https://www.airbnb.com/calendar/ical/1720411060516391898.ics?t=17aba1d84e1f418a873964021c6f62df&locale=en-GB",
    "https://ical.booking.com/v1/export?t=ecfacf12-f812-4da2-a7c4-ceaee5477e7d",
  ].join("\n"),
  wholeHouseFeeds: "https://www.airbnb.com/calendar/ical/1726596390666088734.ics?t=e4d65d0c0319447e9e21da7b50bd12a8&locale=en-GB",
};

function mergeFeedUrls(primary: string, fallback: string): string {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const source of [fallback, primary]) {
    for (const url of splitFeedUrls(source)) {
      if (seen.has(url)) continue;
      seen.add(url);
      merged.push(url);
    }
  }

  return merged.join("\n");
}

export function loadCalendarConfig(): CalendarConfig {
  try {
    const raw = localStorage.getItem(AVAILABILITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CalendarConfig>;
      return {
        floor1Feeds: mergeFeedUrls(parsed.floor1Feeds ?? "", defaultCalendarConfig.floor1Feeds),
        floor2Feeds: mergeFeedUrls(parsed.floor2Feeds ?? "", defaultCalendarConfig.floor2Feeds),
        wholeHouseFeeds: mergeFeedUrls(parsed.wholeHouseFeeds ?? "", defaultCalendarConfig.wholeHouseFeeds),
      };
    }
  } catch {
    /* ignore */
  }

  return { ...defaultCalendarConfig };
}

export function saveCalendarConfig(config: CalendarConfig): void {
  localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(config));
}

export function resetCalendarConfig(): void {
  localStorage.removeItem(AVAILABILITY_KEY);
}

export function splitFeedUrls(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function buildProxyUrl(feedUrl: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}api/availability?url=${encodeURIComponent(feedUrl)}`;
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function parseIcsDateToken(raw: string): { date: Date; allDay: boolean } | null {
  const value = raw.trim();
  const allDayMatch = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (allDayMatch) {
    const [, y, m, d] = allDayMatch;
    return { date: new Date(Number(y), Number(m) - 1, Number(d)), allDay: true };
  }

  const dateTimeMatch = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!dateTimeMatch) return null;

  const [, y, m, d, hh, mm, ss, z] = dateTimeMatch;
  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);

  if (z === "Z") {
    return { date: new Date(Date.UTC(year, month, day, hour, minute, second)), allDay: false };
  }

  return { date: new Date(year, month, day, hour, minute, second), allDay: false };
}

function unfoldIcsLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n?/g, "\n");
  const lines: string[] = [];

  for (const line of normalized.split("\n")) {
    if (/^[ \t]/.test(line) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  return lines;
}

function parseEventBlock(block: string): { start: Date | null; end: Date | null } | null {
  const lines = unfoldIcsLines(block);
  const fields = new Map<string, string[]>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const idx = line.indexOf(":");
    if (idx < 0) continue;

    const key = line.slice(0, idx).split(";")[0].toUpperCase();
    const value = line.slice(idx + 1);
    const current = fields.get(key) ?? [];
    current.push(value);
    fields.set(key, current);
  }

  const status = (fields.get("STATUS") ?? []).join(" ").toUpperCase();
  if (status.includes("CANCELLED")) return null;

  const startRaw = fields.get("DTSTART")?.[0] ?? null;
  const endRaw = fields.get("DTEND")?.[0] ?? null;
  if (!startRaw) return null;

  const start = parseIcsDateToken(startRaw);
  const end = endRaw ? parseIcsDateToken(endRaw) : null;

  if (!start) return null;
  return { start: start.date, end: end?.date ?? null };
}

function expandBlockedDates(start: Date, end: Date | null): Set<string> {
  const blocked = new Set<string>();
  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const normalizedEnd = end
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate())
    : addDays(normalizedStart, 1);

  const safeEnd = normalizedEnd <= normalizedStart ? addDays(normalizedStart, 1) : normalizedEnd;

  for (let current = normalizedStart; current < safeEnd; current = addDays(current, 1)) {
    blocked.add(dateKey(current));
  }

  return blocked;
}

function parseBusyDatesFromIcs(raw: string): Set<string> {
  const blocked = new Set<string>();
  const text = raw.replace(/\r\n?/g, "\n");
  const blocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];

  for (const block of blocks) {
    const event = parseEventBlock(block);
    if (!event || !event.start) continue;
    for (const date of expandBlockedDates(event.start, event.end)) {
      blocked.add(date);
    }
  }

  return blocked;
}

export async function fetchBusyDates(feedUrls: string[]): Promise<FetchAvailabilityResult> {
  const blockedDates = new Set<string>();
  const errors: string[] = [];
  const seenErrors = new Set<string>();

  const tasks = feedUrls.map(async (url) => {
    try {
      const response = await fetch(buildProxyUrl(url), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      return parseBusyDatesFromIcs(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const normalized = `${new URL(url).hostname}: ${message}`;
      if (!seenErrors.has(normalized)) {
        seenErrors.add(normalized);
        errors.push(normalized);
      }
      return new Set<string>();
    }
  });

  const results = await Promise.all(tasks);
  for (const result of results) {
    for (const date of result) blockedDates.add(date);
  }

  return { blockedDates, errors };
}
