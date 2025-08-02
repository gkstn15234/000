// DevConnect Service Worker
// PWA 기능을 위한 서비스 워커

const CACHE_NAME = 'devconnect-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/supabase-config.js',
    '/js/auth.js',
    '/js/chat.js',
    '/js/main.js',
    // CDN 리소스는 캐시하지 않음 (CORS 이슈)
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    console.log('Service Worker 설치 중...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('캐시 오픈됨');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('캐시 추가 실패:', error);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
    console.log('Service Worker 활성화됨');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('오래된 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
    // Supabase API 요청은 캐시하지 않음
    if (event.request.url.includes('supabase.co')) {
        return;
    }
    
    // CDN 요청은 캐시하지 않음
    if (event.request.url.includes('cdn.')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 있으면 캐시된 버전 반환
                if (response) {
                    return response;
                }
                
                // 캐시에 없으면 네트워크에서 가져오기
                return fetch(event.request)
                    .then((response) => {
                        // 유효한 응답인지 확인
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 응답을 복제하여 캐시에 저장
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // 네트워크 실패 시 오프라인 페이지 반환 (선택사항)
                        return caches.match('/index.html');
                    });
            })
    );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('백그라운드 동기화 실행');
        // 오프라인 상태에서 저장된 데이터 동기화 로직
    }
});

// 푸시 알림 수신 (선택사항)
self.addEventListener('push', (event) => {
    console.log('푸시 알림 수신:', event.data?.text());
    
    const options = {
        body: event.data?.text() || '새로운 메시지가 있습니다.',
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge-72x72.png',
        tag: 'devconnect-notification',
        renotify: true,
        actions: [
            {
                action: 'open',
                title: '열기',
                icon: '/assets/open-icon.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/assets/close-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('DevConnect', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    console.log('알림 클릭됨:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('DevConnect Service Worker 로드됨');