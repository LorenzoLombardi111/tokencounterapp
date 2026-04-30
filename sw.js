const CACHE = 'freetokencounter-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    '/og-image.svg',
    '/vs-openai-tokenizer',
    '/gpt-4o-token-counter',
    '/claude-token-counter',
    '/how-to-count-tokens-for-llms',
    '/llm-prompt-cost-calculator'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== location.origin) return;

    e.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(req, copy));
                }
                return res;
            }).catch(() => caches.match('/'));
        })
    );
});

self.addEventListener('message', (e) => {
    if (e.data === 'skipWaiting') self.skipWaiting();
});
