(function () {
    'use strict';

    var shellCacheName = 'pwaweather-appshell';
    var dataCacheName = 'pwaweather-data';

    var filesToCache = [
        '../index.html',
        '../Scripts/app.js',
        '../Styles/inline.css',
        '../Images/clear.png',
        '../Images/cloudy-scattered-showers.png',
        '../Images/cloudy.png',
        '../Images/fog.png',
        '../Images/ic_add_white_24px.svg',
        '../Images/ic_refresh_white_24px.svg',
        '../Images/partly-cloudy.png',
        '../Images/rain.png',
        '../Images/scattered-showers.png',
        '../Images/sleet.png',
        '../Images/snow.png',
        '../Images/thunderstorm.png',
        '../Images/wind.png'
    ];

    self.addEventListener('install', function (e) {
        console.log('[ServiceWorker] Install');
        e.waitUntil(
            caches.open(shellCacheName).then(function (cache) {
                console.log('[ServiceWorker] Caching App Shell');
                return cache.addAll(filesToCache);
            })
        );
    });

    self.addEventListener('activate', function (e) {
        console.log('[ServiceWorker] Activate');
        e.waitUntil(
            caches.keys().then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== shellCacheName) {
                        console.log('[ServiceWork] Removing old cache ', key);
                        return caches.delete(key);
                    }
                }));
            })
        );

        return self.clients.claim();
    });

    self.addEventListener('fetch', function (e) {
        console.log('[ServiceWorker] Fetch', e.request.url);
        var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
        // e.respondWith(
        //     caches.match(e.request).then(function (response) {
        //         return response || fetch(e.request);
        //     })
        // );
        if (e.request.url.indexOf(dataUrl) > -1) {
            e.respondWith(
                caches.open(dataCacheName).then(function (cache) {
                    return fetch(e.request).then(function (response) {
                        cache.put(e.request.url, response.clone());
                        return response;
                    });
                })
            );
        } else {
            e.respondWith(
                caches.match(e.request).then(function (response) {
                    return response || fetch(e.request);
                })
            );
        }
    });
})();
