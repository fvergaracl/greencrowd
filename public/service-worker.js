self.addEventListener("install", event => {
  console.log("Service Worker installed")
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", event => {
  console.log("Service Worker activated")
  event.waitUntil(self.clients.claim())
})

// Permitir geolocalización
self.addEventListener("fetch", event => {
  if (event.request.url.includes("geolocation")) {
    console.log("Allowing geolocation request:", event.request.url)
  }
})
