import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin, Phone, Users, BedDouble, Bath, Mountain, Play,
  Coffee, Wifi, Car, X, Globe, ChevronLeft, ChevronRight, Settings,
  Tv, Wind, Refrigerator, Microwave, Utensils, Instagram,
  Check, Volume2, VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Language, LANG_KEY, translations, type AdminTranslation } from "@/i18n";
import {
  loadMedia, saveMedia, resetMedia, getYouTubeId, tryAlternateImageFormat,
  FLOOR1_KEYS, FLOOR2_KEYS, OUTDOOR_KEYS,
  WATERFALL_VIDEO_PATH,
  type MediaStore, type MediaSlot, defaultMedia,
} from "@/media";
import {
  loadCalendarConfig,
  saveCalendarConfig,
  resetCalendarConfig,
  defaultCalendarConfig,
  splitFeedUrls,
  fetchBusyDates,
  type CalendarConfig,
  type FloorId,
} from "@/availability";

const MAPS_URL = "https://www.google.com/maps/place/Quba+Garden+Resort/@41.2389011,48.151807,12z/data=!4m10!1m2!2m1!1squba+garden+resort!3m6!1s0x40378ff704e28249:0xfe2a35e3985784ad!8m2!3d41.2389011!4d48.3042423!15sChJxdWJhIGdhcmRlbiByZXNvcnSSARhob2xpZGF5X2FwYXJ0bWVudF9yZW50YWzgAQA!16s%2Fg%2F11nqx_803q?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D";
const MAPS_EMBED = "https://maps.google.com/maps?q=41.2389011,48.3042423&output=embed&hl=az&z=15";
const PHONE = "+994556673067";
const WHATSAPP_BASE = "https://wa.me/994556673067";
const AIRBNB_URL = "https://www.airbnb.co.uk/rooms/1720411060516391898?unique_share_id=644c77f5-cf50-4094-a306-28f8e11356e3&viralityEntryPoint=1&s=76";
const INSTAGRAM_URL = "https://www.instagram.com/qubagardenresort/";
const INSTAGRAM_HANDLE = "@qubagardenresort";
/* â”€â”€â”€ hooks â”€â”€â”€ */
function useLang() {
  const [lang, setLangState] = useState<Language>(() => {
    const s = localStorage.getItem(LANG_KEY);
    return s === 'az' || s === 'en' || s === 'ru' ? s : 'az';
  });
  const setLang = useCallback((l: Language) => { localStorage.setItem(LANG_KEY, l); setLangState(l); }, []);
  return { lang, setLang, t: translations[lang] };
}

function useMedia() {
  const [media, setMediaState] = useState<MediaStore>(loadMedia);
  const update = useCallback((s: MediaStore) => { saveMedia(s); setMediaState({ ...s }); }, []);
  const reset = useCallback(() => { resetMedia(); setMediaState({ ...defaultMedia }); }, []);
  return { media, update, reset };
}

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return scrolled;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isSameDay(left: Date, right: Date): boolean {
  return formatDateKey(left) === formatDateKey(right);
}

function isBeforeDay(left: Date, right: Date): boolean {
  return formatDateKey(left) < formatDateKey(right);
}

function isAfterDay(left: Date, right: Date): boolean {
  return formatDateKey(left) > formatDateKey(right);
}

function diffInNights(checkinKey: string, checkoutKey: string): number {
  const start = parseDateKey(checkinKey);
  const end = parseDateKey(checkoutKey);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
}

function getLocale(lang: Language): string {
  return lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US";
}

function shiftMonth(month: Date, delta: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

function buildMonthCells(month: Date): Array<Date | null> {
  const firstDay = startOfMonth(month).getDay();
  const daysInMonth = endOfMonth(month).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  return cells;
}

function isBlockedOrPast(date: Date, blockedDates: Set<string>): boolean {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return isBeforeDay(date, todayStart) || blockedDates.has(formatDateKey(date));
}

function isPastDate(date: Date): boolean {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return isBeforeDay(date, todayStart);
}

function mergeDateSets(...sets: Set<string>[]): Set<string> {
  const merged = new Set<string>();
  for (const set of sets) {
    for (const date of set) merged.add(date);
  }
  return merged;
}

function mergeUniqueStrings(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of groups) {
    for (const value of group) {
      if (seen.has(value)) continue;
      seen.add(value);
      merged.push(value);
    }
  }

  return merged;
}

function rangeContainsBlockedDates(startKey: string, endKey: string, blockedDates: Set<string>): boolean {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (end <= start) return true;

  for (let current = start; isBeforeDay(current, end); current = addDays(current, 1)) {
    if (blockedDates.has(formatDateKey(current))) return true;
  }

  return false;
}

/* â”€â”€â”€ video embed â”€â”€â”€ */
function VideoEmbed({ url, autoPlay = false, muted = true, className = "" }: {
  url: string; autoPlay?: boolean; muted?: boolean; className?: string;
}) {
  if (!url) return null;
  const ytId = getYouTubeId(url);
  if (ytId) {
    const p = new URLSearchParams({ autoplay: autoPlay ? '1' : '0', mute: muted ? '1' : '0', loop: '1', playlist: ytId, controls: autoPlay ? '0' : '1', modestbranding: '1', rel: '0' });
    return <iframe src={`https://www.youtube.com/embed/${ytId}?${p}`} className={className} allow="autoplay; encrypted-media" allowFullScreen title="video" />;
  }
  return <video src={url} autoPlay={autoPlay} muted={muted} loop playsInline preload={autoPlay ? 'auto' : 'metadata'} className={className} />;
}

/* â”€â”€â”€ scroll reveal â”€â”€â”€ */
function Reveal({ children, delay = 0, className = "", y = 36 }: {
  children: React.ReactNode; delay?: number; className?: string; y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.12 });
  return (
    <motion.div ref={ref} className={className}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
      initial={{ opacity: 0, y }}>
      {children}
    </motion.div>
  );
}


/* â”€â”€â”€ floor carousel â”€â”€â”€ */
function FloorCarousel({ images, testId }: { images: string[]; testId: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" data-testid={testId}>
      <div className="aspect-[4/3]">
        <motion.img key={idx} src={images[idx]} alt="" loading="lazy" decoding="async" onError={tryAlternateImageFormat} className="w-full h-full object-cover"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={prev} aria-label="prev" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} aria-label="next" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* â”€â”€â”€ video slot â”€â”€â”€ */
function VideoSlot({ url, label, poster }: { url: string; label: string; poster?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => url && setOpen(true)}
        className={`relative aspect-video rounded-2xl overflow-hidden group ${url ? 'cursor-pointer' : 'cursor-default'}`}>
        {poster && <img src={poster} alt="" loading="lazy" decoding="async" onError={tryAlternateImageFormat} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale" />}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white ml-1" />
          </div>
          <span className="text-white text-sm font-medium">{label}</span>
          {!url && <span className="text-white/50 text-xs text-center px-4">Admin panelindÉ™n video URL É™lavÉ™ edin</span>}
        </div>
      </div>
      {open && url && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-full max-w-4xl aspect-video">
            <VideoEmbed url={url} autoPlay className="w-full h-full rounded-2xl" />
          </div>
        </div>
      )}
    </>
  );
}


/* â”€â”€â”€ amenity icon â”€â”€â”€ */
function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('wi-fi') || n.includes('wifi')) return <Wifi className="w-6 h-6" />;
  if (n.includes('tv') || n.includes('smart')) return <Tv className="w-6 h-6" />;
  if (n.includes('kondi') || n.includes('air')) return <Wind className="w-6 h-6" />;
  if (n.includes('soyudu') || n.includes('refrig') || n.includes('Ñ…Ð¾Ð»Ð¾Ð´Ð¸Ð»')) return <Refrigerator className="w-6 h-6" />;
  if (n.includes('mikrodalÄŸa') || n.includes('micro') || n.includes('Ð¼Ð¸ÐºÑ€Ð¾')) return <Microwave className="w-6 h-6" />;
  if (n.includes('parkinq') || n.includes('parking') || n.includes('Ð¿Ð°Ñ€ÐºÐ¾Ð²')) return <Car className="w-6 h-6" />;
  if (n.includes('balkon') || n.includes('balc')) return <Mountain className="w-6 h-6" />;
  if (n.includes('mÉ™nzÉ™rÉ™') || n.includes('view') || n.includes('Ð²Ð¸Ð´')) return <Mountain className="w-6 h-6" />;
  if (n.includes('hÉ™yÉ™t') || n.includes('yard') || n.includes('Ð´Ð²Ð¾Ñ€')) return <Mountain className="w-6 h-6" />;
  if (n.includes('Ã§aydanÄ±') || n.includes('kettle') || n.includes('Ñ‡Ð°Ð¹Ð½')) return <Coffee className="w-6 h-6" />;
  if (n.includes('su') || n.includes('water') || n.includes('Ð²Ð¾Ð´')) return <Check className="w-6 h-6" />;
  if (n.includes('mÉ™tbÉ™x') || n.includes('kitchen') || n.includes('ÐºÑƒÑ…Ð½')) return <Utensils className="w-6 h-6" />;
  return <Utensils className="w-6 h-6" />;
}

/* â”€â”€â”€ floor amenity icon â”€â”€â”€ */
function FloorAmenityIcon({ text }: { text: string }) {
  const l = text.toLowerCase();
  if (l.includes('yataq') || l.includes('bed') || l.includes('ÑÐ¿Ð°Ð»ÑŒÐ½')) return <BedDouble className="w-4 h-4 text-secondary" />;
  if (l.includes('hamam') || l.includes('bath') || l.includes('Ð²Ð°Ð½Ð½')) return <Bath className="w-4 h-4 text-secondary" />;
  if (l.includes('mÉ™tbÉ™x') || l.includes('kitchen') || l.includes('ÐºÑƒÑ…Ð½')) return <Coffee className="w-4 h-4 text-secondary" />;
  if (l.includes('wi-fi') || l.includes('wifi')) return <Wifi className="w-4 h-4 text-secondary" />;
  if (l.includes('balkon') || l.includes('panoram')) return <Mountain className="w-4 h-4 text-secondary" />;
  if (l.includes('hÉ™yÉ™t') || l.includes('yard') || l.includes('Ð´Ð²Ð¾Ñ€')) return <Car className="w-4 h-4 text-secondary" />;
  return <Mountain className="w-4 h-4 text-secondary" />;
}

/* â”€â”€â”€ file upload helper â”€â”€â”€ */
function FileUploadBtn({ onFile, uploadBtn, uploadWarning }: {
  onFile: (dataUrl: string) => void; uploadBtn: string; uploadWarning: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [warn, setWarn] = useState('');
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setWarn(uploadWarning); return; }
    setWarn('');
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) onFile(ev.target.result as string); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  return (
    <div className="flex flex-col gap-1">
      <input ref={ref} type="file" accept="image/*" onChange={handle} className="hidden" />
      <button type="button" onClick={() => ref.current?.click()}
        className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors whitespace-nowrap">
        {uploadBtn}
      </button>
      {warn && <p className="text-xs text-amber-600">{warn}</p>}
    </div>
  );
}

/* â”€â”€â”€ admin panel â”€â”€â”€ */
function AdminPanel({ media, calendarConfig, onUpdate, onReset, onUpdateCalendar, onResetCalendar, onClose, adminT }: {
  media: MediaStore; calendarConfig: CalendarConfig; onUpdate: (s: MediaStore) => void;
  onReset: () => void; onUpdateCalendar: (s: CalendarConfig) => void; onResetCalendar: () => void;
  onClose: () => void; adminT: AdminTranslation;
}) {
  const [draft, setDraft] = useState<MediaStore>({ ...media });
  const [draftCalendar, setDraftCalendar] = useState<CalendarConfig>({ ...calendarConfig });
  const [tab, setTab] = useState<'images' | 'videos' | 'calendar'>('images');
  const setSlot = (key: MediaSlot, val: string) => setDraft(d => ({ ...d, [key]: val }));
  useEffect(() => { setDraftCalendar({ ...calendarConfig }); }, [calendarConfig]);

  function ImgRow({ label, slotKey }: { label: string; slotKey: MediaSlot }) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
          {draft[slotKey] && <img src={draft[slotKey]} alt="" decoding="async" className="w-full h-full object-cover" onError={tryAlternateImageFormat} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">{label}</div>
          <div className="flex gap-2 items-start">
            <input type="url" value={draft[slotKey]} onChange={e => setSlot(slotKey, e.target.value)}
              placeholder={adminT.urlPlaceholder}
              className="flex-1 min-w-0 text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            <FileUploadBtn onFile={v => setSlot(slotKey, v)} uploadBtn={adminT.uploadBtn} uploadWarning={adminT.uploadWarning} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" data-testid="admin-panel">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl">{adminT.title}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="admin-close"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex border-b border-border px-5">
          {(['images','videos','calendar'] as const).map(t2 => (
            <button key={t2} onClick={() => setTab(t2)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === t2 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              data-testid={`admin-tab-${t2}`}>
              {t2 === 'images'
                ? `${adminT.images} (${1 + FLOOR1_KEYS.length + FLOOR2_KEYS.length + OUTDOOR_KEYS.length})`
                : t2 === 'videos'
                  ? `${adminT.videos} (2)`
                  : 'Calendar'}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {tab === 'images' && (
            <>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{adminT.heroImage}</p>
                <ImgRow label="Hero" slotKey="hero" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{adminT.floor1Images}</p>
                <div className="space-y-3">{FLOOR1_KEYS.map((k,i) => <ImgRow key={k} label={`${i+1}`} slotKey={k} />)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{adminT.floor2Images}</p>
                <div className="space-y-3">{FLOOR2_KEYS.map((k,i) => <ImgRow key={k} label={`${i+1}`} slotKey={k} />)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{adminT.galleryImages}</p>
                <div className="space-y-3">{OUTDOOR_KEYS.map((k,i) => <ImgRow key={k} label={`${i+1}`} slotKey={k} />)}</div>
              </div>
            </>
          )}
          {tab === 'videos' && (
            <div className="space-y-6">
              {(['video_hero','video_tour'] as MediaSlot[]).map((k, i) => (
                <div key={k}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{i === 0 ? adminT.heroVideo : adminT.floorVideo}</p>
                  <p className="text-xs text-muted-foreground mb-3">{adminT.videoPlaceholder}</p>
                  <input type="url" value={draft[k]} onChange={e => setSlot(k, e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid={`admin-input-${k}`} />
                </div>
              ))}
            </div>
          )}
          {tab === 'calendar' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Floor 1 availability feeds</p>
                <p className="text-xs text-muted-foreground mb-3">Paste Airbnb and Booking.com .ics URLs here, one per line.</p>
                <textarea
                  value={draftCalendar.floor1Feeds}
                  onChange={e => setDraftCalendar(d => ({ ...d, floor1Feeds: e.target.value }))}
                  placeholder="https://.../calendar.ics"
                  className="w-full min-h-28 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Floor 2 availability feeds</p>
                <p className="text-xs text-muted-foreground mb-3">Paste Airbnb and Booking.com .ics URLs here, one per line.</p>
                <textarea
                  value={draftCalendar.floor2Feeds}
                  onChange={e => setDraftCalendar(d => ({ ...d, floor2Feeds: e.target.value }))}
                  placeholder="https://.../calendar.ics"
                  className="w-full min-h-28 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Whole house availability feeds</p>
                <p className="text-xs text-muted-foreground mb-3">Paste the whole-house Airbnb .ics URL here.</p>
                <textarea
                  value={draftCalendar.wholeHouseFeeds}
                  onChange={e => setDraftCalendar(d => ({ ...d, wholeHouseFeeds: e.target.value }))}
                  placeholder="https://.../calendar.ics"
                  className="w-full min-h-24 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">These feeds are proxied through the site and merged into the availability calendar.</p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-border flex items-center justify-between gap-3">
          <button onClick={() => { onReset(); onResetCalendar(); setDraft({ ...defaultMedia }); setDraftCalendar({ ...defaultCalendarConfig }); }}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors" data-testid="admin-reset">{adminT.reset}</button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} data-testid="admin-cancel">{adminT.close}</Button>
            <Button onClick={() => { onUpdate(draft); onUpdateCalendar(draftCalendar); onClose(); }} data-testid="admin-save">{adminT.save}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• LANDING PAGE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function LandingPage() {
  const { lang, setLang, t } = useLang();
  const { media, update, reset } = useMedia();
  const scrolled = useScrolled(80);
  const [adminOpen, setAdminOpen] = useState(false);
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig>(loadCalendarConfig);
  const [blockedDatesByFloor, setBlockedDatesByFloor] = useState<Record<FloorId, Set<string>>>({
    floor1: new Set(),
    floor2: new Set(),
    whole: new Set(),
  });
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarErrors, setCalendarErrors] = useState<string[]>([]);
  const [calendarRefreshedAt, setCalendarRefreshedAt] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<FloorId>("floor1");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const aboutSectionRef = useRef<HTMLElement>(null);
  const aboutVideoRef = useRef<HTMLVideoElement>(null);
  const [aboutSoundOn, setAboutSoundOn] = useState(false);

  /* booking form state */
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [bookingNote, setBookingNote] = useState('');

  /* footer triple-click â†’ admin */
  const footerClicks = useRef(0);
  const footerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFooterClick = () => {
    footerClicks.current++;
    if (footerTimer.current) clearTimeout(footerTimer.current);
    if (footerClicks.current >= 3) { footerClicks.current = 0; setAdminOpen(true); return; }
    footerTimer.current = setTimeout(() => { footerClicks.current = 0; }, 2000);
  };
  useEffect(() => () => { if (footerTimer.current) clearTimeout(footerTimer.current); }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const toggleAboutSound = () => {
    const video = aboutVideoRef.current;
    const nextSoundOn = !aboutSoundOn;
    setAboutSoundOn(nextSoundOn);
    if (video) {
      video.muted = !nextSoundOn;
      video.volume = nextSoundOn ? 0.2 : 0;
      video.play().catch(() => setAboutSoundOn(false));
    }
  };

  useEffect(() => {
    const video = aboutVideoRef.current;
    const section = aboutSectionRef.current;
    if (!video || !section) return;

    let frame = 0;
    const updateVolume = () => {
      frame = 0;
      if (!aboutSoundOn) {
        video.volume = 0;
        video.muted = true;
        return;
      }

      const rect = section.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = Math.max(0, Math.min(1, visible / Math.min(rect.height, window.innerHeight)));
      const volume = Math.max(0, Math.min(1, (ratio - 0.12) / 0.55));

      video.volume = volume;
      video.muted = volume <= 0.02;
      if (volume > 0.02) video.play().catch(() => setAboutSoundOn(false));
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateVolume);
    };

    updateVolume();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [aboutSoundOn]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      setCalendarLoading(true);

      const [floor1Result, floor2Result] = await Promise.all([
        fetchBusyDates(splitFeedUrls(calendarConfig.floor1Feeds)),
        fetchBusyDates(splitFeedUrls(calendarConfig.floor2Feeds)),
      ]);
      const wholeHouseResult = await fetchBusyDates(splitFeedUrls(calendarConfig.wholeHouseFeeds));

      if (cancelled) return;

      setBlockedDatesByFloor({
        floor1: floor1Result.blockedDates,
        floor2: floor2Result.blockedDates,
        whole: wholeHouseResult.blockedDates.size
          ? wholeHouseResult.blockedDates
          : mergeDateSets(floor1Result.blockedDates, floor2Result.blockedDates),
      });
      setCalendarErrors(mergeUniqueStrings(floor1Result.errors, floor2Result.errors, wholeHouseResult.errors));
      setCalendarRefreshedAt(new Date().toISOString());
      setCalendarLoading(false);
    };

    refresh().catch(() => {
      if (!cancelled) setCalendarLoading(false);
    });

    const timer = window.setInterval(() => {
      refresh().catch(() => {
        if (!cancelled) setCalendarLoading(false);
      });
    }, 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [calendarConfig]);

  /* build WhatsApp booking message */
  const buildWhatsAppUrl = () => {
    const lines: string[] = [t.booking.whatsappGreeting];
    lines.push(`${t.booking.whatsappFloor}: ${selectedFloor === "floor1" ? t.booking.floor1 : selectedFloor === "floor2" ? t.booking.floor2 : t.booking.wholeHouse}`);
    if (checkin) lines.push(`${t.booking.whatsappCheckin}: ${checkin}`);
    if (checkout) lines.push(`${t.booking.whatsappCheckout}: ${checkout}`);
    if (checkin && checkout) lines.push(`${t.booking.whatsappNights}: ${diffInNights(checkin, checkout)}`);
    if (guests) lines.push(`${t.booking.whatsappGuests}: ${guests}`);
    if (bookingNote.trim()) lines.push(`${t.booking.whatsappNote}: ${bookingNote.trim()}`);
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  /* media helpers */
  const floor1Imgs = FLOOR1_KEYS.map(k => media[k]);
  const floor2Imgs = FLOOR2_KEYS.map(k => media[k]);
  const outdoorImgs = OUTDOOR_KEYS.map(k => media[k]);

  const currentBlockedDates = blockedDatesByFloor[selectedFloor];
  const monthCells = buildMonthCells(visibleMonth);
  const monthLabel = `${t.booking.months[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;
  const weekdayLabels = t.booking.weekdays;
  const formatSelectedDate = (key: string) => {
    const date = parseDateKey(key);
    return `${String(date.getDate()).padStart(2, "0")} ${t.booking.months[date.getMonth()]} ${date.getFullYear()}`;
  };
  const selectedRangeInvalid = Boolean(
    checkin && checkout && (
      !isBeforeDay(parseDateKey(checkin), parseDateKey(checkout)) ||
      rangeContainsBlockedDates(checkin, checkout, currentBlockedDates)
    )
  );
  const selectedNights = checkin && checkout ? diffInNights(checkin, checkout) : 0;
  const sendDisabled = !checkin || !checkout || selectedRangeInvalid;
  const handleCalendarDayClick = (date: Date) => {
    if (isBlockedOrPast(date, currentBlockedDates)) return;

    const key = formatDateKey(date);
    if (!checkin || checkout) {
      setCheckin(key);
      setCheckout("");
      return;
    }

    const start = parseDateKey(checkin);
    if (isSameDay(start, date)) {
      setCheckout("");
      return;
    }

    if (isBeforeDay(date, start)) {
      setCheckout(checkin);
      setCheckin(key);
      return;
    }

    setCheckout(key);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">

      {/* â”€â”€ Navbar â”€â”€ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-border/60' : 'bg-transparent'}`}>
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <button onClick={() => scrollTo('hero')}
            className={`font-serif text-[clamp(0.88rem,3.2vw,1.25rem)] max-w-[48vw] truncate font-semibold whitespace-nowrap transition-colors duration-300 ${scrolled ? 'text-primary' : 'text-white'}`}>
            {t.siteName}
          </button>
          <div className="hidden md:flex items-center space-x-5 text-sm font-medium">
            {([
              ['hero', t.nav.home],
              ['about', t.nav.about],
              ['amenities', t.nav.amenities],
              ['location', t.nav.location],
              ['booking', t.nav.contact],
            ] as [string, string][]).map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`transition-colors hover:text-secondary ${scrolled ? 'text-foreground' : 'text-white/90 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-0 sm:gap-0.5">
              <Globe className={`hidden min-[380px]:block w-4 h-4 ${scrolled ? 'text-muted-foreground' : 'text-white/70'}`} />
              {(['az','en','ru'] as Language[]).map(l => (
                <button key={l} onClick={() => setLang(l)} data-testid={`lang-${l}`}
                  className={`px-1 sm:px-1.5 py-0.5 text-[11px] sm:text-xs uppercase font-medium rounded transition-colors ${lang === l ? (scrolled ? 'text-primary font-bold' : 'text-white font-bold') : (scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/60 hover:text-white')}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => scrollTo('booking')} data-testid="button-nav-book"
              className={`shrink-0 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${!scrolled ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 border backdrop-blur-sm' : ''}`}>
              {t.nav.bookNow}
            </Button>
          </div>
        </div>
      </nav>

      {/* â”€â”€ Hero â”€â”€ */}
      <section id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {media.video_hero
            ? <VideoEmbed url={media.video_hero} autoPlay muted className="w-full h-full object-cover" />
            : <img src={media.hero} alt="" decoding="async" onError={tryAlternateImageFormat} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-8 hover:bg-black/40 transition-colors">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium tracking-wider">{t.hero.location}</span>
            </a>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-white mb-5 sm:mb-6 leading-tight drop-shadow-lg">{t.hero.title}</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-light mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">{t.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 flex-wrap max-w-sm sm:max-w-none mx-auto">
              <Button size="lg" onClick={() => scrollTo('booking')} className="text-base px-8 py-5 w-full sm:w-auto" data-testid="button-hero-book">
                {t.hero.book}
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-5 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm">
                <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" data-testid="button-hero-whatsapp">{t.hero.whatsapp}</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-5 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm">
                <a href={AIRBNB_URL} target="_blank" rel="noopener noreferrer" data-testid="button-hero-airbnb">{t.hero.airbnb}</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-5 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid="button-hero-instagram">
                  <Instagram className="w-5 h-5" />{INSTAGRAM_HANDLE}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-px h-10 bg-white/40 mx-auto" />
        </motion.div>
      </section>

      {/* â”€â”€ Booking / Contact â”€â”€ */}
      <section id="booking" className="scroll-mt-20 py-16 sm:py-24 bg-card">
        <div className="container mx-auto max-w-6xl px-3 min-[420px]:px-4">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4">{t.booking.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.booking.subtitle}</p>
          </Reveal>
          <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:items-start">
            <Reveal delay={0.05} className="min-w-0">
              <Card className="h-full min-w-0 shadow-lg sm:overflow-hidden sm:shadow-xl border-border/60">
                <CardContent className="min-w-0 p-2.5 min-[390px]:p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="grid min-w-0 grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedFloor("floor1")}
                        className={`min-w-0 px-3 sm:px-4 py-2 rounded-full text-[11px] min-[360px]:text-xs sm:text-sm font-medium leading-tight transition-colors ${selectedFloor === "floor1" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                      >
                        {t.booking.floor1}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFloor("floor2")}
                        className={`min-w-0 px-3 sm:px-4 py-2 rounded-full text-[11px] min-[360px]:text-xs sm:text-sm font-medium leading-tight transition-colors ${selectedFloor === "floor2" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                      >
                        {t.booking.floor2}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFloor("whole")}
                        className={`min-w-0 min-[360px]:col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 rounded-full text-[11px] min-[360px]:text-xs sm:text-sm font-medium leading-tight transition-colors ${selectedFloor === "whole" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                      >
                        {t.booking.wholeHouse}
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-right">
                      {calendarLoading ? t.booking.refreshing : calendarRefreshedAt ? `${t.booking.updated} ${new Date(calendarRefreshedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : t.booking.waiting}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                      <h3 className="font-serif text-xl min-[390px]:text-2xl sm:text-3xl text-foreground capitalize">{monthLabel}</h3>
                      <p className="mx-auto max-w-[292px] min-[375px]:max-w-[320px] min-[430px]:max-w-[360px] lg:max-w-none text-[11px] min-[390px]:text-xs sm:text-sm text-muted-foreground leading-relaxed">{t.booking.monthHint}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleMonth(month => shiftMonth(month, -1))}
                        className="w-9 h-9 min-[390px]:w-10 min-[390px]:h-10 rounded-full border border-border text-foreground hover:bg-accent transition-colors"
                        aria-label={t.booking.previousMonth}
                      >
                        <ChevronLeft className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibleMonth(month => shiftMonth(month, 1))}
                        className="w-9 h-9 min-[390px]:w-10 min-[390px]:h-10 rounded-full border border-border text-foreground hover:bg-accent transition-colors"
                        aria-label={t.booking.nextMonth}
                      >
                        <ChevronRight className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full min-w-0 pb-1">
                    <div className="mx-auto w-full max-w-[292px] min-[375px]:max-w-[320px] min-[430px]:max-w-[360px] md:max-w-[420px] lg:max-w-none">
                      <div className="grid grid-cols-7 gap-1 lg:gap-2 text-center text-[8px] min-[390px]:text-[9px] lg:text-[11px] uppercase tracking-normal lg:tracking-[0.18em] text-muted-foreground">
                        {weekdayLabels.map(day => <div key={day}>{day}</div>)}
                      </div>

                      <div className="grid grid-cols-7 gap-1 lg:gap-2 mt-1 lg:mt-2">
                        {monthCells.map((cell, index) => {
                          if (!cell) {
                            return <div key={`empty-${index}`} className="h-[38px] min-[375px]:h-[42px] min-[430px]:h-[46px] md:h-[52px] lg:aspect-square lg:h-auto rounded-md lg:rounded-xl bg-transparent" />;
                          }

                          const key = formatDateKey(cell);
                          const isBlocked = isBlockedOrPast(cell, currentBlockedDates);
                          const isPast = isPastDate(cell);
                          const isStart = checkin === key;
                          const isEnd = checkout === key;
                          const isBetween = Boolean(checkin && checkout && isAfterDay(cell, parseDateKey(checkin)) && isBeforeDay(cell, parseDateKey(checkout)));
                          const isToday = isSameDay(cell, new Date());

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleCalendarDayClick(cell)}
                              className={`relative h-[38px] min-[375px]:h-[42px] min-[430px]:h-[46px] md:h-[52px] min-w-0 lg:aspect-square lg:h-auto rounded-[0.55rem] min-[390px]:rounded-md lg:rounded-xl border text-[9px] min-[390px]:text-[10px] lg:text-sm font-medium transition-all ${isBlocked
                                ? isPast
                                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 line-through cursor-not-allowed"
                                  : "bg-red-100 text-red-500 border-red-200 line-through cursor-not-allowed"
                                : isStart || isEnd
                                  ? "bg-green-600 text-white border-green-700 shadow-sm"
                                  : isBetween
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : "bg-green-50 text-foreground border-green-200 hover:border-green-500 hover:bg-green-100"
                                } ${isToday ? "ring-2 ring-secondary/60" : ""}`}
                              disabled={isBlocked}
                              aria-label={key}
                            >
                              <span className="absolute top-1 left-1 lg:top-2 lg:left-2 text-[8px] min-[390px]:text-[9px] lg:text-xs leading-none">{cell.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mx-auto flex w-full max-w-[292px] min-[375px]:max-w-[320px] min-[430px]:max-w-[360px] md:max-w-[420px] lg:max-w-none flex-wrap items-center gap-1.5 min-[390px]:gap-2 lg:gap-3 text-[9px] min-[390px]:text-[10px] lg:text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 lg:gap-2"><span className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border border-green-200 bg-green-50" /> {t.booking.available}</span>
                    <span className="inline-flex items-center gap-1.5 lg:gap-2"><span className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border border-green-700 bg-green-600" /> {t.booking.selected}</span>
                    <span className="inline-flex items-center gap-1.5 lg:gap-2"><span className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border border-red-200 bg-red-100" /> {t.booking.blocked}</span>
                  </div>

                  {calendarErrors.length > 0 && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs sm:text-sm text-amber-900 space-y-1">
                      <p className="font-medium">{t.booking.feedErrorTitle}</p>
                      <p className="text-[11px] sm:text-xs">{t.booking.feedErrorHint}</p>
                      <details className="group">
                        <summary className="cursor-pointer list-none text-[11px] sm:text-xs font-medium text-amber-800/90">
                          {t.booking.feedErrorDetails}
                        </summary>
                        <ul className="mt-2 list-disc pl-5 space-y-1 text-[11px] sm:text-xs">
                          {calendarErrors.slice(0, 3).map(err => <li key={err}>{err}</li>)}
                        </ul>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="shadow-xl border-border/60 h-full bg-card/95">
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-5 font-sans">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{t.booking.selectedFloor}</p>
                      <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                        {selectedFloor === "floor1" ? t.booking.floor1 : selectedFloor === "floor2" ? t.booking.floor2 : t.booking.wholeHouse}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCheckin(""); setCheckout(""); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t.booking.clearDates}
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.booking.checkin}</div>
                      <div className="mt-1 text-sm sm:text-base font-medium text-foreground break-words">{checkin ? formatSelectedDate(checkin) : t.booking.selectDates}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.booking.checkout}</div>
                      <div className="mt-1 text-sm sm:text-base font-medium text-foreground break-words">{checkout ? formatSelectedDate(checkout) : t.booking.selectDates}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">{t.booking.guests}</label>
                      <input type="number" min="1" max="14" value={guests} onChange={e => setGuests(e.target.value)}
                        data-testid="input-guests"
                        className="w-full border border-border rounded-2xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-sans" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">{t.booking.note}</label>
                      <input type="text" value={bookingNote} onChange={e => setBookingNote(e.target.value)}
                        placeholder={t.booking.notePlaceholder}
                        data-testid="input-note"
                        className="w-full border border-border rounded-2xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-sans" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{t.booking.calendarOnly}</p>

                  <div className={`rounded-2xl border px-4 py-3 text-sm font-sans ${selectedRangeInvalid ? "border-amber-300 bg-amber-50 text-amber-900" : "border-border bg-muted text-foreground"}`}>
                    <p className="font-medium mb-1 break-words">{checkin && checkout ? `${checkin} to ${checkout} (${selectedNights} nights)` : t.booking.selectDates}</p>
                    <p>{selectedRangeInvalid ? t.booking.invalidRange : t.booking.requestReady}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full py-5 sm:py-6 text-sm sm:text-base" disabled={sendDisabled} onClick={() => window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer")}>
                      {t.booking.sendRequest}
                    </Button>
                    <Button size="lg" variant="outline" className="w-full py-4 sm:py-5 text-sm sm:text-base border-secondary/40 text-secondary hover:bg-secondary/5" asChild>
                      <a href={AIRBNB_URL} target="_blank" rel="noopener noreferrer" data-testid="button-book-airbnb">
                        {t.booking.airbnbBtn}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* â”€â”€ About â”€â”€ */}
      <section id="about" ref={aboutSectionRef} className="scroll-mt-20 relative min-h-[100svh] py-16 sm:py-24 overflow-hidden">
        <video
          ref={aboutVideoRef}
          src={WATERFALL_VIDEO_PATH}
          autoPlay
          muted={!aboutSoundOn}
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "57% center" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/40 sm:bg-none sm:bg-black/35" />
        <button
          type="button"
          onClick={toggleAboutSound}
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label={aboutSoundOn ? "Mute waterfall sound" : "Play waterfall sound"}
          data-testid="button-about-sound"
        >
          {aboutSoundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
        <div className="relative z-10 container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-4">{t.about.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-5 sm:mb-6" />
            <p className="text-white/85 max-w-3xl mx-auto leading-relaxed text-base">{t.about.subtitle}</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {t.about.rooms.map((room, i) => (
              <Reveal key={room.name} delay={i * 0.08}>
                <Card className="h-full bg-white/78 backdrop-blur-md border-white/45 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:bg-white/92 sm:backdrop-blur-sm">
                  <CardContent className="p-5 sm:p-6">
                    <h3 className="font-serif text-xl text-foreground mb-4 pb-3 border-b border-border">{room.name}</h3>
                    {'items' in room ? (
                      <ul className="space-y-2">
                        {(room.items as readonly string[]).map(item => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed italic">{(room as { name: string; text: string }).text}</p>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Floors â”€â”€ */}
      <section id="floors" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4">{t.floors.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-5 sm:mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.floors.subtitle}</p>
          </Reveal>
          <div className="space-y-16 sm:space-y-20">
            {/* Floor 1 */}
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <Reveal className="order-2 md:order-1 space-y-5" delay={0.1}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-2xl sm:text-3xl font-serif">{t.floors.floor1.title}</h3>
                  <span className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />{t.floors.floor1.guests}
                  </span>
                </div>
                <p className="text-muted-foreground">{t.floors.floor1.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {t.floors.floor1.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      <FloorAmenityIcon text={a} />{a}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <VideoSlot url={media.video_hero} label={t.floors.floor1.videoLabel} poster={floor1Imgs[0]} />
                </div>
              </Reveal>
              <Reveal className="order-1 md:order-2">
                <FloorCarousel images={floor1Imgs} testId="carousel-floor-1" />
              </Reveal>
            </div>
            {/* Floor 2 */}
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <Reveal>
                <FloorCarousel images={floor2Imgs} testId="carousel-floor-2" />
              </Reveal>
              <Reveal className="space-y-5" delay={0.1}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-2xl sm:text-3xl font-serif">{t.floors.floor2.title}</h3>
                  <span className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />{t.floors.floor2.guests}
                  </span>
                </div>
                <p className="text-muted-foreground">{t.floors.floor2.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {t.floors.floor2.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      <FloorAmenityIcon text={a} />{a}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <VideoSlot url={media.video_tour} label={t.floors.floor2.videoLabel} poster={floor2Imgs[0]} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Amenities â”€â”€ */}
      <section id="amenities" className="scroll-mt-20 py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4">{t.amenities.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto" />
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
            {t.amenities.list.map((item, i) => (
              <Reveal key={item} delay={i * 0.04} className="text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <AmenityIcon name={item} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight text-center">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Why Us â”€â”€ */}
      <section id="whyus" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4">{t.whyUs.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto" />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.whyUs.cards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <Card className="text-center p-6 border-border/60 hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-0 space-y-3">
                    <div className="text-4xl">{card.icon}</div>
                    <h3 className="font-serif text-lg text-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <section id="location" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4">{t.location.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-6" />
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">
              <MapPin className="w-4 h-4" />{t.location.address}
            </a>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2">
            <Reveal>
              <div className="h-[280px] sm:h-[360px] md:h-[400px] rounded-2xl overflow-hidden border border-border shadow-md">
                <iframe
                  src={MAPS_EMBED}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  title="map"
                />
              </div>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" data-testid="link-open-maps"
                className="inline-flex items-center gap-2 mt-4 text-sm text-secondary hover:text-secondary/80 transition-colors font-medium">
                <MapPin className="w-4 h-4" />{t.location.openMaps}
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-secondary" />{t.location.directions}
                  </h3>
                  <ul className="space-y-3">
                    {t.location.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold">{i+1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground italic">{t.location.note}</p>
                </div>
                <div className="border-t border-border pt-5">
                  <h4 className="font-serif text-lg text-foreground mb-3">{t.location.nearby}</h4>
                  <div className="flex flex-wrap gap-2">
                    {t.location.nearbyList.map(item => (
                      <span key={item} className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* â”€â”€ Footer â”€â”€ */}
      <footer className="bg-zinc-950 py-12 sm:py-14 text-zinc-400">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3 mb-10">
            <div>
              <button onClick={handleFooterClick} data-testid="footer-sitename"
                className="font-serif text-2xl text-white mb-3 block bg-transparent border-none cursor-pointer hover:text-secondary transition-colors select-none">
                {t.siteName}
              </button>
              <p className="text-sm leading-relaxed">{t.footer.address}</p>
            </div>
            <div className="space-y-3">
              <a href={`tel:${PHONE}`} className="flex items-center gap-3 text-sm hover:text-zinc-200 transition-colors" data-testid="footer-phone">
                <Phone className="w-4 h-4 text-secondary" />{PHONE}
              </a>
              <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-zinc-200 transition-colors" data-testid="footer-whatsapp">
                <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={AIRBNB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-zinc-200 transition-colors" data-testid="footer-airbnb">
                <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 1.892a3.257 3.257 0 00-3.12 2.31C6.893 8.526 3.997 13.476 1.998 17.75c-.997 2.128.25 4.75 2.623 5.19 1.187.22 2.41-.164 3.25-1.024l4.128-4.222 4.128 4.222c.84.86 2.063 1.244 3.25 1.025 2.373-.44 3.62-3.063 2.623-5.19-1.999-4.274-4.895-9.224-6.883-13.548a3.257 3.257 0 00-3.12-2.31zm0 2.13c.553 0 1.058.32 1.301.82C15.29 8.895 18.2 13.87 20.2 18.15c.42.898-.117 1.942-1.08 2.12-.487.09-.98-.068-1.327-.419l-5.79-5.924-5.79 5.924a1.38 1.38 0 01-1.328.42c-.963-.18-1.5-1.223-1.08-2.121 2-4.28 4.908-9.255 6.898-13.308a1.42 1.42 0 011.3-.82z"/></svg>
                Airbnb
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-zinc-200 transition-colors" data-testid="footer-instagram">
                <Instagram className="w-4 h-4 text-secondary" />{INSTAGRAM_HANDLE}
              </a>
            </div>
            <div className="space-y-3">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-zinc-200 transition-colors" data-testid="footer-maps">
                <MapPin className="w-4 h-4 text-secondary" />Google Maps
              </a>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-6 text-center text-sm text-zinc-600">
            Â© {new Date().getFullYear()} {t.siteName}. {t.footer.rights}
          </div>
        </div>
      </footer>

      {/* â”€â”€ Mobile sticky WhatsApp â”€â”€ */}
      <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer"
        className="md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:bg-[#20bd5c] transition-colors"
        data-testid="mobile-whatsapp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>


      {/* â”€â”€ Admin Panel â”€â”€ */}
      {adminOpen && (
        <AdminPanel
          media={media}
          calendarConfig={calendarConfig}
          onUpdate={update}
          onReset={reset}
          onUpdateCalendar={cfg => { setCalendarConfig(cfg); saveCalendarConfig(cfg); }}
          onResetCalendar={() => { const next = { ...defaultCalendarConfig }; setCalendarConfig(next); resetCalendarConfig(); }}
          onClose={() => setAdminOpen(false)}
          adminT={t.admin as AdminTranslation}
        />
      )}
    </div>
  );
}
