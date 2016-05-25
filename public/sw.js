/* eslint-env serviceworker, browser */

const cached = [
  'js/base32.js',
  'js/crypto.js',
  'js/index.js',
  'js/main.js',
  'js/modernizr.js',
  'js/storage.js',
  'pouchdb/dist/pouchdb.js'
]

const uneeded = [
  'js/asmcrypto.js'
]

self.addEventListener('install', event => {
  console.log(event)
  event.waitUntil(
    caches.open('TFA-v1').then(cache => {
      return cache.addAll(cached)
    })
  )
})

self.addEventListener('activate', event => {
  console.log(event)
})

self.addEventListener('fetch', event => {
  const requestUrl = event.request.url

  event.respondWith(
    caches.match(event.request).then(response => {
      if (uneeded.some(url => requestUrl.endsWith(url))) {
        return new Response(null, {status: 204})
      }

      return response || fetch(event.request)
    })
  )
})
