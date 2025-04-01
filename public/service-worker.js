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

self.addEventListener("push", function (event) {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: "/icon.png",
    data: data.url || "/"
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data))
})
