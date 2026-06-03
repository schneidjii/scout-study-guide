const CACHE = 'scout-guide-v260603';
const BASE = '/scout-study-guide';

const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  BASE + '/scout-assets/scout_oath_and_law_infographic_poster.png',
  BASE + '/scout-assets/scout_spirit_living_the_oath_daily.png',
  BASE + '/scout-assets/scout_sign_salute_handshake_guide.png',
  BASE + '/scout-assets/first_class_scout_badge_breakdown.png',
  BASE + '/scout-assets/outdoor_code_and_leave_no_trace.png',
  BASE + '/scout-assets/scout_knot_and_rope_care_guide.png',
  BASE + '/scout-assets/rope_care_for_scouts_and_adventurers.png',
  BASE + '/scout-assets/pocketknife_safety_guidelines_for_scouts.png',
  BASE + '/scout-assets/how_scout_advancement_works_infographic.png',
  BASE + '/scout-assets/patrol_method_in_scouting_explained.png',
  BASE + '/scout-assets/scoutmaster_conference_prep_checklist.png',
  BASE + '/scout-assets/scout_uniform_guide_for_young_scouts.png',
  BASE + '/scout-assets/flag_ceremony_basics_for_scouts.png',
];

// Install — pre-cache all app assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — cache-first for app assets, network-first for Google/YouTube
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network for Google Forms and YouTube
  if (url.hostname.includes('google.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('youtube.com') ||
      url.hostname.includes('ytimg.com') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('', { status: 200 }))
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(BASE + '/index.html'));
    })
  );
});
