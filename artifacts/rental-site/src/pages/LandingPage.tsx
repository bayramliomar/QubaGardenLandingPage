import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin, Phone, Users, BedDouble, Bath, Mountain, Play,
  Coffee, Wifi, Car, X, Globe, ChevronLeft, ChevronRight, Settings,
  Tv, Wind, Refrigerator, Microwave, Utensils, Instagram,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Language, LANG_KEY, translations, type AdminTranslation } from "@/i18n";
import {
  loadMedia, saveMedia, resetMedia, getYouTubeId, tryAlternateImageFormat,
  FLOOR1_KEYS, FLOOR2_KEYS, OUTDOOR_KEYS,
  type MediaStore, type MediaSlot, defaultMedia,
} from "@/media";

const MAPS_URL = "https://www.google.com/maps/place/Quba+Garden+Resort/@41.2389011,48.151807,12z/data=!4m10!1m2!2m1!1squba+garden+resort!3m6!1s0x40378ff704e28249:0xfe2a35e3985784ad!8m2!3d41.2389011!4d48.3042423!15sChJxdWJhIGdhcmRlbiByZXNvcnSSARhob2xpZGF5X2FwYXJ0bWVudF9yZW50YWzgAQA!16s%2Fg%2F11nqx_803q?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D";
const MAPS_EMBED = "https://maps.google.com/maps?q=41.2389011,48.3042423&output=embed&hl=az&z=15";
const PHONE = "+994556673067";
const WHATSAPP_BASE = "https://wa.me/994556673067";
const AIRBNB_URL = "https://www.airbnb.co.uk/rooms/1720411060516391898?unique_share_id=644c77f5-cf50-4094-a306-28f8e11356e3&viralityEntryPoint=1&s=76";
const INSTAGRAM_URL = "https://www.instagram.com/qubagardenresort/";
const INSTAGRAM_HANDLE = "@qubagardenresort";

/* ─── hooks ─── */
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

/* ─── video embed ─── */
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

/* ─── scroll reveal ─── */
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

/* ─── gallery image ─── */
function GalleryImg({ src, index, onClick }: {
  src: string; index: number; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.08 });
  const delay = ((index % 3) + Math.floor(index / 3)) * 0.08;
  return (
    <motion.div ref={ref} className="mb-4 overflow-hidden rounded-2xl cursor-pointer bg-muted shadow-sm break-inside-avoid"
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      initial={{ opacity: 0, scale: 0.9, y: 24 }}
      onClick={onClick}>
      <img src={src} alt="" loading="lazy" decoding="async" onError={tryAlternateImageFormat} className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]" />
    </motion.div>
  );
}

/* ─── floor carousel ─── */
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

/* ─── video slot ─── */
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
          {!url && <span className="text-white/50 text-xs text-center px-4">Admin panelindən video URL əlavə edin</span>}
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

/* ─── lightbox ─── */
function Lightbox({ images, startIdx, onClose }: { images: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });
  return (
    <div className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
        <ChevronRight className="w-6 h-6" />
      </button>
      <img src={images[idx]} alt="" decoding="async" onError={tryAlternateImageFormat} className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{idx + 1} / {images.length}</div>
    </div>
  );
}

/* ─── amenity icon ─── */
function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('wi-fi') || n.includes('wifi')) return <Wifi className="w-6 h-6" />;
  if (n.includes('tv') || n.includes('smart')) return <Tv className="w-6 h-6" />;
  if (n.includes('kondi') || n.includes('air')) return <Wind className="w-6 h-6" />;
  if (n.includes('soyudu') || n.includes('refrig') || n.includes('холодил')) return <Refrigerator className="w-6 h-6" />;
  if (n.includes('mikrodalğa') || n.includes('micro') || n.includes('микро')) return <Microwave className="w-6 h-6" />;
  if (n.includes('parkinq') || n.includes('parking') || n.includes('парков')) return <Car className="w-6 h-6" />;
  if (n.includes('balkon') || n.includes('balc')) return <Mountain className="w-6 h-6" />;
  if (n.includes('mənzərə') || n.includes('view') || n.includes('вид')) return <Mountain className="w-6 h-6" />;
  if (n.includes('həyət') || n.includes('yard') || n.includes('двор')) return <Mountain className="w-6 h-6" />;
  if (n.includes('çaydanı') || n.includes('kettle') || n.includes('чайн')) return <Coffee className="w-6 h-6" />;
  if (n.includes('su') || n.includes('water') || n.includes('вод')) return <Check className="w-6 h-6" />;
  if (n.includes('mətbəx') || n.includes('kitchen') || n.includes('кухн')) return <Utensils className="w-6 h-6" />;
  return <Utensils className="w-6 h-6" />;
}

/* ─── floor amenity icon ─── */
function FloorAmenityIcon({ text }: { text: string }) {
  const l = text.toLowerCase();
  if (l.includes('yataq') || l.includes('bed') || l.includes('спальн')) return <BedDouble className="w-4 h-4 text-secondary" />;
  if (l.includes('hamam') || l.includes('bath') || l.includes('ванн')) return <Bath className="w-4 h-4 text-secondary" />;
  if (l.includes('mətbəx') || l.includes('kitchen') || l.includes('кухн')) return <Coffee className="w-4 h-4 text-secondary" />;
  if (l.includes('wi-fi') || l.includes('wifi')) return <Wifi className="w-4 h-4 text-secondary" />;
  if (l.includes('balkon') || l.includes('panoram')) return <Mountain className="w-4 h-4 text-secondary" />;
  if (l.includes('həyət') || l.includes('yard') || l.includes('двор')) return <Car className="w-4 h-4 text-secondary" />;
  return <Mountain className="w-4 h-4 text-secondary" />;
}

/* ─── file upload helper ─── */
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

/* ─── admin panel ─── */
function AdminPanel({ media, onUpdate, onReset, onClose, adminT }: {
  media: MediaStore; onUpdate: (s: MediaStore) => void;
  onReset: () => void; onClose: () => void; adminT: AdminTranslation;
}) {
  const [draft, setDraft] = useState<MediaStore>({ ...media });
  const [tab, setTab] = useState<'images' | 'videos'>('images');
  const setSlot = (key: MediaSlot, val: string) => setDraft(d => ({ ...d, [key]: val }));

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
          {(['images','videos'] as const).map(t2 => (
            <button key={t2} onClick={() => setTab(t2)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === t2 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              data-testid={`admin-tab-${t2}`}>
              {t2 === 'images' ? `${adminT.images} (${1 + FLOOR1_KEYS.length + FLOOR2_KEYS.length + OUTDOOR_KEYS.length})` : `${adminT.videos} (2)`}
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
        </div>
        <div className="p-5 border-t border-border flex items-center justify-between gap-3">
          <button onClick={() => { onReset(); setDraft({ ...defaultMedia }); }}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors" data-testid="admin-reset">{adminT.reset}</button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} data-testid="admin-cancel">{adminT.close}</Button>
            <Button onClick={() => { onUpdate(draft); onClose(); }} data-testid="admin-save">{adminT.save}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ LANDING PAGE ═══════════════════════ */
export default function LandingPage() {
  const { lang, setLang, t } = useLang();
  const { media, update, reset } = useMedia();
  const scrolled = useScrolled(80);
  const [adminOpen, setAdminOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null);
  const [galleryTab, setGalleryTab] = useState(0);

  /* booking form state */
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [bookingNote, setBookingNote] = useState('');

  /* footer triple-click → admin */
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

  /* build WhatsApp booking message */
  const buildWhatsAppUrl = () => {
    const lines: string[] = ['Salam! Rezervasiya etmək istəyirəm.'];
    if (checkin) lines.push(`Giriş tarixi: ${checkin}`);
    if (checkout) lines.push(`Çıxış tarixi: ${checkout}`);
    if (guests) lines.push(`Qonaq sayı: ${guests}`);
    if (bookingNote.trim()) lines.push(`Qeyd: ${bookingNote.trim()}`);
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  /* media helpers */
  const floor1Imgs = FLOOR1_KEYS.map(k => media[k]);
  const floor2Imgs = FLOOR2_KEYS.map(k => media[k]);
  const outdoorImgs = OUTDOOR_KEYS.map(k => media[k]);

  const galleryGroups = [
    [...floor1Imgs, ...floor2Imgs, ...outdoorImgs],
    floor1Imgs,
    floor2Imgs,
    outdoorImgs,
  ];
  const currentGallery = galleryGroups[galleryTab];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-border/60' : 'bg-transparent'}`}>
        <div className="container mx-auto px-2.5 sm:px-4 h-16 flex items-center justify-between gap-2">
          <button onClick={() => scrollTo('hero')}
            className={`font-serif text-[clamp(0.88rem,3.2vw,1.25rem)] font-semibold whitespace-nowrap transition-colors duration-300 ${scrolled ? 'text-primary' : 'text-white'}`}>
            {t.siteName}
          </button>
          <div className="hidden md:flex items-center space-x-5 text-sm font-medium">
            {([
              ['hero', t.nav.home],
              ['about', t.nav.about],
              ['gallery', t.nav.gallery],
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

      {/* ── Hero ── */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {media.video_hero
            ? <VideoEmbed url={media.video_hero} autoPlay muted className="w-full h-full object-cover" />
            : <img src={media.hero} alt="" decoding="async" onError={tryAlternateImageFormat} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-8 hover:bg-black/40 transition-colors">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium tracking-wider">{t.hero.location}</span>
            </a>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight drop-shadow-lg">{t.hero.title}</h1>
            <p className="text-lg md:text-xl text-white/90 font-light mb-10 max-w-2xl mx-auto leading-relaxed">{t.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
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

      {/* ── About ── */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.about.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-6" />
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base">{t.about.subtitle}</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.about.rooms.map((room, i) => (
              <Reveal key={room.name} delay={i * 0.08}>
                <Card className="h-full border-border/60 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
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

      {/* ── Gallery ── */}
      <section id="gallery" className="py-20 bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.gallery.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-8" />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {t.gallery.tabs.map((tab, i) => (
                <button key={i} onClick={() => setGalleryTab(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${galleryTab === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                  data-testid={`gallery-tab-${i}`}>{tab}</button>
              ))}
            </div>
          </Reveal>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {currentGallery.map((src, i) => (
              <GalleryImg key={`${galleryTab}-${i}`} src={src} index={i}
                onClick={() => setLightbox({ images: currentGallery, idx: i })} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Floors ── */}
      <section id="floors" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.floors.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.floors.subtitle}</p>
          </Reveal>
          <div className="space-y-20">
            {/* Floor 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Reveal className="order-2 md:order-1 space-y-5" delay={0.1}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-3xl font-serif">{t.floors.floor1.title}</h3>
                  <span className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />{t.floors.floor1.guests}
                  </span>
                </div>
                <p className="text-muted-foreground">{t.floors.floor1.description}</p>
                <div className="grid grid-cols-2 gap-2.5">
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
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Reveal>
                <FloorCarousel images={floor2Imgs} testId="carousel-floor-2" />
              </Reveal>
              <Reveal className="space-y-5" delay={0.1}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-3xl font-serif">{t.floors.floor2.title}</h3>
                  <span className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />{t.floors.floor2.guests}
                  </span>
                </div>
                <p className="text-muted-foreground">{t.floors.floor2.description}</p>
                <div className="grid grid-cols-2 gap-2.5">
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

      {/* ── Amenities ── */}
      <section id="amenities" className="py-24 bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.amenities.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto" />
          </Reveal>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
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

      {/* ── Why Us ── */}
      <section id="whyus" className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.whyUs.title}</h2>
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

      {/* ── Booking / Contact ── */}
      <section id="booking" className="py-24 bg-card">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.booking.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto" />
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="shadow-xl border-border/60">
              <CardContent className="p-8 md:p-10">
                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{t.booking.checkin}</label>
                    <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)}
                      data-testid="input-checkin"
                      className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{t.booking.checkout}</label>
                    <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)}
                      data-testid="input-checkout"
                      className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{t.booking.guests}</label>
                    <input type="number" min="1" max="14" value={guests} onChange={e => setGuests(e.target.value)}
                      data-testid="input-guests"
                      className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{t.booking.note}</label>
                    <input type="text" value={bookingNote} onChange={e => setBookingNote(e.target.value)}
                      placeholder={t.booking.notePlaceholder}
                      data-testid="input-note"
                      className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button size="lg" className="w-full py-6 text-base" asChild>
                    <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" data-testid="button-book-whatsapp">
                      {t.booking.whatsappBtn}
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full py-5 text-base border-secondary/40 text-secondary hover:bg-secondary/5" asChild>
                    <a href={AIRBNB_URL} target="_blank" rel="noopener noreferrer" data-testid="button-book-airbnb">
                      {t.booking.airbnbBtn}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ── Location ── */}
      <section id="location" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{t.location.title}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-6" />
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">
              <MapPin className="w-4 h-4" />{t.location.address}
            </a>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal>
              <div className="h-[400px] rounded-2xl overflow-hidden border border-border shadow-md">
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

      {/* ── Footer ── */}
      <footer className="bg-zinc-950 py-14 text-zinc-400">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
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
            © {new Date().getFullYear()} {t.siteName}. {t.footer.rights}
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky WhatsApp ── */}
      <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer"
        className="md:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:bg-[#20bd5c] transition-colors"
        data-testid="mobile-whatsapp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* ── Lightbox ── */}
      {lightbox && <Lightbox images={lightbox.images} startIdx={lightbox.idx} onClose={() => setLightbox(null)} />}

      {/* ── Admin Panel ── */}
      {adminOpen && (
        <AdminPanel media={media} onUpdate={update} onReset={reset}
          onClose={() => setAdminOpen(false)} adminT={t.admin as AdminTranslation} />
      )}
    </div>
  );
}
