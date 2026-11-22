// The game used to live at this address and registered a service worker
// here. It has moved to play/, with its own worker. Without this file the
// old worker would stay installed and keep answering this address with an
// out-of-date copy of the game.
//
// This worker replaces the old one, clears what it stored, removes itself,
// and reloads any open page so it shows the site.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      // The game's new worker keeps its files under a name that includes
      // play/. Those are left alone.
      await Promise.all(names.filter((name) => !name.includes('/play/')).map((name) => caches.delete(name)));
      await self.registration.unregister();
      const pages = await self.clients.matchAll({ type: 'window' });
      pages.forEach((page) => page.navigate(page.url));
    })()
  );
});
