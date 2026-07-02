import type { SyntheticEvent } from 'react';

export const MEDIA_KEY = 'qgr_media';

export const MEDIA_BASE_URL = 'https://pub-86580cd82f124d3082f47fd3d2a40d59.r2.dev';

export const FLOOR1_KEYS = [
  'floor1_0','floor1_1','floor1_2','floor1_3','floor1_4','floor1_5','floor1_6','floor1_7','floor1_8','floor1_9','floor1_10','floor1_11','floor1_12','floor1_13','floor1_15','floor1_16','floor1_17','floor1_18',
] as const;

export const FLOOR2_KEYS = [
  'floor2_1','floor2_2','floor2_3','floor2_4','floor2_5','floor2_6','floor2_7','floor2_8','floor2_9','floor2_10','floor2_11','floor2_12','floor2_13','floor2_14','floor2_15','floor2_16','floor2_17','floor2_18','floor2_19',
] as const;

export const OUTDOOR_KEYS = [
  'outdoor_1','outdoor_2','outdoor_3','outdoor_4','outdoor_5','outdoor_6','outdoor_7','outdoor_8','outdoor_9','outdoor_10','outdoor_11','outdoor_12','outdoor_13','outdoor_14','outdoor_15','outdoor_16','outdoor_17','outdoor_18','outdoor_19','outdoor_20','outdoor_21','outdoor_22',
] as const;

export type MediaSlot =
  | 'hero'
  | 'video_hero'
  | 'video_tour'
  | (typeof FLOOR1_KEYS)[number]
  | (typeof FLOOR2_KEYS)[number]
  | (typeof OUTDOOR_KEYS)[number];

export type MediaStore = Record<MediaSlot, string>;

export const COVER_VIDEO_PATH = `${MEDIA_BASE_URL}/videos/cover.mp4`;

function slotToOptimizedPath(slot: string): string {
  const fileName = `${slot.replace('_', '-')}-optimized.jpg`;

  if (slot.startsWith('floor1_')) return `${MEDIA_BASE_URL}/images/floor1/${fileName}`;
  if (slot.startsWith('floor2_')) return `${MEDIA_BASE_URL}/images/floor2/${fileName}`;
  if (slot.startsWith('outdoor_')) return `${MEDIA_BASE_URL}/images/outdoor/${fileName}`;

  return `${MEDIA_BASE_URL}/${fileName}`;
}

function buildDefaults(): MediaStore {
  return {
    hero: `${MEDIA_BASE_URL}/hero.png`,
    ...Object.fromEntries(FLOOR1_KEYS.map((key) => [key, slotToOptimizedPath(key)])),
    ...Object.fromEntries(FLOOR2_KEYS.map((key) => [key, slotToOptimizedPath(key)])),
    ...Object.fromEntries(OUTDOOR_KEYS.map((key) => [key, slotToOptimizedPath(key)])),
    video_hero: COVER_VIDEO_PATH,
    video_tour: COVER_VIDEO_PATH,
  } as MediaStore;
}

export const defaultMedia: MediaStore = buildDefaults();

export function loadMedia(): MediaStore {
  try {
    const raw = localStorage.getItem(MEDIA_KEY);
    if (raw) return migrateMedia({ ...defaultMedia, ...JSON.parse(raw) });
  } catch {
    /* ignore */
  }

  return { ...defaultMedia };
}

function migrateMedia(media: MediaStore): MediaStore {
  for (const slot of [...FLOOR1_KEYS, ...FLOOR2_KEYS, ...OUTDOOR_KEYS]) {
    const current = media[slot];

    if (!current || current.startsWith('/') || current.includes('/media/')) {
      media[slot] = slotToOptimizedPath(slot);
    }
  }

  if (!media.hero || media.hero.startsWith('/')) {
    media.hero = `${MEDIA_BASE_URL}/hero.png`;
  }

  if (!media.video_hero || media.video_hero.startsWith('/')) {
    media.video_hero = COVER_VIDEO_PATH;
  }

  if (!media.video_tour || media.video_tour.startsWith('/')) {
    media.video_tour = COVER_VIDEO_PATH;
  }

  return media;
}

export function saveMedia(store: MediaStore): void {
  localStorage.setItem(MEDIA_KEY, JSON.stringify(store));
}

export function resetMedia(): void {
  localStorage.removeItem(MEDIA_KEY);
}

export function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
  return m ? m[1] : null;
}

export function tryAlternateImageFormat(event: SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (img.dataset.fallbackTried === 'true') return;

  const url = new URL(img.currentSrc || img.src, window.location.origin);
  const nextPath = url.pathname.endsWith('.jpg')
    ? url.pathname.replace(/\.jpg$/, '.png')
    : url.pathname.endsWith('.jpeg')
      ? url.pathname.replace(/\.jpeg$/, '.png')
      : url.pathname.endsWith('.png')
        ? url.pathname.replace(/\.png$/, '.jpg')
        : '';

  if (!nextPath) return;

  img.dataset.fallbackTried = 'true';
  img.src = `${url.origin}${nextPath}${url.search}${url.hash}`;
}