// Nombre de la caché que crearemos
// Este es el nombre que le damos a nuestra caché. La podemos cambiar cuando queramos actualizarla.
const CACHE_NAME = 'pwa-cache-v1';

// Lista de archivos que queremos almacenar en la caché
// Aquí definimos qué archivos serán guardados localmente por el navegador. Esto permite que la aplicación funcione sin conexión.
const FILES_TO_CACHE = [
    '/', // Página raíz (index.html por defecto)
    '/index.html', // Archivo HTML principal
    '/manifest.json', // Manifest de la PWA (configuración de la app)
    '/imagenes/icon-192x192.png', // Icono de 192x192 (para pantallas pequeñas)
    '/imagenes/icon-512x512.png' // Icono de 512x512 (para pantallas más grandes)
];
// Evento de instalación: este se ejecuta cuando el navegador detecta que no hay un Service Worker instalado
// o cuando hay una nueva versión del Service Worker. Aquí almacenamos los archivos definidos en la caché.
self.addEventListener('install', (event) => {
    // event.waitUntil: espera a que la promesa dentro de ella termine antes de marcar el Service Worker como instalado.
    event.waitUntil(
        // Abrimos la caché con el nombre definido en CACHE_NAME.
        caches.open(CACHE_NAME)
        .then((cache) => {
            // Una vez abierta la caché, agregamos todos los archivos definidos en FILES_TO_CACHE.
            console.log('Archivos enviados a caché correctamente');
            // cache.addAll: agrega todos los archivos listados a la caché.
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Evento de activación: se dispara cuando el nuevo Service Worker toma control de la página
// Aquí eliminamos cachés antiguas si el nombre de la caché ha cambiado, manteniendo solo la más reciente.
self.addEventListener('activate', (event) => {
    // Esperamos a que todas las promesas dentro de event.waitUntil se completen antes de que el Service Worker sea activado.
    event.waitUntil(
        // caches.keys: devuelve una lista con todas las cachés disponibles en el navegador.
        caches.keys().then((cacheNames) => {
            // Promise.all: espera a que todas las promesas (en este caso, la eliminación de las cachés) se completen.
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Comparamos el nombre de cada caché almacenada con el nuevo CACHE_NAME.
                    // Si no coinciden, eliminamos la caché antigua.
                    if (cacheName !== CACHE_NAME) {
                        console.log('Caché antigua eliminada');
                        return caches.delete(cacheName); // Elimina cachés que no son la actual.
                    }
                })
            );
        })
    );
});

// Evento fetch: se activa cada vez que la aplicación realiza una petición HTTP
// Aquí interceptamos esas peticiones y respondemos con los archivos de la caché si están disponibles.
self.addEventListener('fetch', (event) => {
    // respondWith: permite que modifiquemos la respuesta a la petición (por ejemplo, devolviendo archivos de la caché).
    event.respondWith(
        // caches.match: busca en la caché si el archivo solicitado ya está almacenado.
        caches.match(event.request)
        .then((response) => {
            // Si el archivo está en la caché (response no es null), lo devuelve.
            return response || fetch(event.request); // Si no está en la caché, hace la solicitud a la red.
        })
    );
});
