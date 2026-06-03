const CACHE = 'scout-guide-v260603';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './scout-assets/scout_oath_and_law_infographic_poster.png',
  './scout-assets/scout_spirit_living_the_oath_daily.png',
  './scout-assets/scout_sign_salute_handshake_guide.png',
  './scout-assets/first_class_scout_badge_breakdown.png',
  './scout-assets/outdoor_code_and_leave_no_trace.png',
  './scout-assets/scout_knot_and_rope_care_guide.png',
  './scout-assets/rope_care_for_scouts_and_adventurers.png',
  './scout-assets/pocketknife_safety_guidelines_for_scouts.png',
  './scout-assets/how_scout_advancement_works_infographic.png',
  './scout-assets/patrol_method_in_scouting_explained.png',
  './scout-assets/scoutmaster_conference_prep_checklist.png',
  './scout-assets/scout_uniform_guide_for_young_scouts.png',
  './scout-assets/flag_ceremony_basics_for_scouts.png',
];

// Install — pre-cache all app assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for app assets, network-first for Google Forms (tracking)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always hit the network for Google Forms submissions (tracking)
  if (url.hostname.includes('google.com') || url.hostname.includes('googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 200 })));
    return;
  }

  // Always hit the network for YouTube embeds
  if (url.hostname.includes('youtube.com') || url.hostname.includes('ytimg.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 200 })));
    return;
  }

  // Cache-first for everything else (app shell + assets)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
