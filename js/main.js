// DevConnect 메인 애플리케이션

class DevConnectApp {
    constructor() {
        this.version = '1.0.0';
        this.features = {
            codeSharing: false,
            videoMeeting: true,
            mentoring: true,
            projectShowcase: true
        };
        
        this.init();
    }

    // 애플리케이션 초기화
    init() {
        console.log(`DevConnect v${this.version} 시작됨`);
        
        // DOM 로드 완료 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    // DOM 준비 완료 후 실행
    onDOMReady() {
        this.setupEventListeners();
        this.initializeFeatures();
        this.setupSearchFunctionality();
        this.loadWelcomeContent();
        
        console.log('DevConnect 애플리케이션이 준비되었습니다.');
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 검색 기능
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // 빠른 액션 버튼들
        this.setupQuickActionButtons();

        // 키보드 단축키
        this.setupKeyboardShortcuts();

        // 윈도우 리사이즈 대응
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    // 빠른 액션 버튼 설정
    setupQuickActionButtons() {
        // 화상 회의 버튼
        const videoCallBtn = document.getElementById('videoCallBtn');
        if (videoCallBtn) {
            videoCallBtn.addEventListener('click', () => this.openVideoCallModal());
        }

            // 새 채널 생성 버튼
        const createChannelBtn = document.getElementById('createChannelBtn');
        if (createChannelBtn) {
            createChannelBtn.addEventListener('click', () => this.createNewChannel());
        }

        // 엔터키로 채널 생성
        const newChannelInput = document.getElementById('newChannelInput');
        if (newChannelInput) {
            newChannelInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createNewChannel();
                }
            });
        }

        // 화상회의 모달 관련
        const saveMeetingBtn = document.getElementById('saveMeetingBtn');
        const closeMeetingModal = document.getElementById('closeMeetingModal');
        
        if (saveMeetingBtn) {
            saveMeetingBtn.addEventListener('click', () => this.saveMeetingUrl());
        }
        
        if (closeMeetingModal) {
            closeMeetingModal.addEventListener('click', () => this.closeVideoCallModal());
        }
    }

    // 키보드 단축키 설정
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: 검색 포커스
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }

            // Ctrl/Cmd + Enter: 메시지 전송
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const messageInput = document.getElementById('messageInput');
                if (messageInput === document.activeElement) {
                    e.preventDefault();
                    chatManager?.sendMessage();
                }
            }

            // ESC: 모달 닫기
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // 기능 초기화
    initializeFeatures() {
        this.setupCodeHighlighting();
        this.setupTooltips();
        this.setupProgressiveWebApp();
    }

    // 코드 하이라이팅 설정
    setupCodeHighlighting() {
        // Prism.js 설정
        if (window.Prism) {
            Prism.highlightAll();
            
            // 코드 블록에 복사 버튼 추가
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('copy-code-btn')) {
                    this.copyCodeToClipboard(e.target);
                }
            });
        }
    }

    // 툴팁 설정
    setupTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title]');
        elementsWithTooltips.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    // PWA 설정
    setupProgressiveWebApp() {
        // 서비스 워커 등록
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker 등록 성공:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 등록 실패:', error);
                });
        }

        // 앱 설치 프롬프트
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });
    }

    // 검색 기능
    setupSearchFunctionality() {
        this.searchData = {
            channels: ['javascript', 'python', 'react', 'nodejs', 'ai'],
            users: [],
            messages: [],
            projects: []
        };
    }

    // 검색 처리
    handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.performSearch(query);
        this.showSearchResults(results);
    }

    // 검색 실행
    performSearch(query) {
        const results = {
            channels: [],
            users: [],
            messages: [],
            projects: []
        };

        const lowerQuery = query.toLowerCase();

        // 채널 검색
        results.channels = this.searchData.channels.filter(channel => 
            channel.toLowerCase().includes(lowerQuery)
        );

        return results;
    }

    // 검색 결과 표시
    showSearchResults(results) {
        // 검색 결과 UI 생성 및 표시
        console.log('검색 결과:', results);
    }

    // 검색 결과 숨기기
    hideSearchResults() {
        // 검색 결과 UI 숨기기
    }


    // 새 채널 생성
    createNewChannel() {
        const input = document.getElementById('newChannelInput');
        const channelName = input.value.trim();
        
        if (!channelName) {
            if (window.authManager) {
                authManager.showToast('채널명을 입력해주세요.', 'warning');
            }
            return;
        }

        // 채널명 유효성 검사
        if (!/^[a-zA-Z0-9가-힣\s-_]+$/.test(channelName)) {
            if (window.authManager) {
                authManager.showToast('유효하지 않은 채널명입니다.', 'warning');
            }
            return;
        }

        // 채널 목록에 추가
        this.addChannelToList(channelName);
        
        // 입력 필드 초기화
        input.value = '';
        
        if (window.authManager) {
            authManager.showToast(`'${channelName}' 채널이 생성되었습니다!`, 'success');
        }
    }

    // 채널 목록에 추가
    addChannelToList(channelName) {
        const channelList = document.querySelector('.space-y-2');
        if (!channelList) return;

        const channelButton = document.createElement('button');
        channelButton.className = 'channel-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors';
        channelButton.dataset.channel = channelName.toLowerCase().replace(/\s+/g, '-');
        
        // 랜덤 아이콘 선택
        const icons = ['fas fa-hashtag', 'fas fa-code', 'fas fa-comments', 'fas fa-lightbulb', 'fas fa-star'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        
        channelButton.innerHTML = `
            <i class="${randomIcon} text-primary mr-2"></i>${channelName}
            <span class="float-right text-sm text-gray-500">0</span>
        `;
        
        // 채널 클릭 이벤트
        channelButton.addEventListener('click', () => {
            this.switchChannel(channelName);
        });
        
        channelList.appendChild(channelButton);
    }

    // 채널 전환
    switchChannel(channelName) {
        const currentChannelElement = document.getElementById('currentChannel');
        if (currentChannelElement) {
            currentChannelElement.textContent = channelName;
        }
        
        // 모든 채널 버튼에서 active 클래스 제거
        document.querySelectorAll('.channel-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white');
        });
        
        // 현재 채널 버튼에 active 클래스 추가
        event.target.classList.add('bg-primary', 'text-white');
    }

    // 화상회의 모달 열기
    openVideoCallModal() {
        const modal = document.getElementById('videoCallModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // 화상회의 모달 닫기
    closeVideoCallModal() {
        const modal = document.getElementById('videoCallModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 회의 URL 저장
    saveMeetingUrl() {
        const title = document.getElementById('meetingTitle').value;
        const url = document.getElementById('meetingUrl').value;
        
        if (!url.trim()) {
            if (window.authManager) {
                authManager.showToast('회의 URL을 입력해주세요.', 'warning');
            }
            return;
        }

        // URL 유효성 검사
        try {
            new URL(url);
        } catch {
            if (window.authManager) {
                authManager.showToast('유효한 URL을 입력해주세요.', 'warning');
            }
            return;
        }

        // 채팅에 회의 링크 공유
        if (window.chatManager) {
            const meetingMessage = `🎥 **${title || '화상회의'}**\n\n회의 링크: ${url}\n\n지금 참여하세요!`;
            chatManager.sendMessage(meetingMessage);
        }
        
        // 모달 닫기
        this.closeVideoCallModal();
        
        // 입력 필드 초기화
        document.getElementById('meetingTitle').value = '';
        document.getElementById('meetingUrl').value = '';
        
        if (window.authManager) {
            authManager.showToast('회의 링크가 공유되었습니다!', 'success');
        }
    }

    // 멘토링 모달 열기
    openMentoringModal() {
        if (!authManager.isAuthenticated()) {
            authManager.showToast('로그인이 필요합니다.', 'warning');
            return;
        }

        authManager.showToast('멘토링 기능은 곧 출시됩니다!', 'info');
    }

    // 코드 클립보드 복사
    async copyCodeToClipboard(button) {
        const codeBlock = button.closest('.code-block').querySelector('code');
        const code = codeBlock.textContent;

        try {
            await navigator.clipboard.writeText(code);
            authManager.showToast('코드가 클립보드에 복사되었습니다!', 'success');
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            authManager.showToast('복사에 실패했습니다.', 'error');
        }
    }

    // 툴팁 표시
    showTooltip(e) {
        // 툴팁 구현
    }

    // 툴팁 숨기기
    hideTooltip(e) {
        // 툴팁 숨기기 구현
    }

    // 모든 모달 닫기
    closeAllModals() {
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => {
            if (modal.classList.contains('bg-black')) {
                modal.remove();
            }
        });
    }

    // 앱 설치 버튼 표시
    showInstallButton() {
        // PWA 설치 버튼 표시
    }

    // 윈도우 리사이즈 처리
    handleResize() {
        // 반응형 레이아웃 조정
    }

    // 웰컴 콘텐츠 로드
    loadWelcomeContent() {
        // 웰컴 섹션 동적 콘텐츠 로드
        this.updateStats();
    }

    // 통계 업데이트
    updateStats() {
        // 실시간 통계 업데이트
        const stats = {
            developers: Math.floor(Math.random() * 1000) + 5000,
            channels: Math.floor(Math.random() * 20) + 50,
            projects: Math.floor(Math.random() * 500) + 1000
        };

        // 애니메이션과 함께 숫자 업데이트
        this.animateNumbers(stats);
    }

    // 숫자 애니메이션
    animateNumbers(targetNumbers) {
        // 카운터 애니메이션 구현
    }

    // 디바운스 유틸리티
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 에러 핸들링
    handleError(error, context = '') {
        console.error(`DevConnect 에러 [${context}]:`, error);
        
        // 사용자에게 친화적인 에러 메시지 표시
        let userMessage = '예상치 못한 오류가 발생했습니다.';
        
        if (error.message && error.message.includes('network')) {
            userMessage = '네트워크 연결을 확인해주세요.';
        } else if (error.message && error.message.includes('auth')) {
            userMessage = '인증에 문제가 발생했습니다. 다시 로그인해주세요.';
        }
        
        authManager.showToast(userMessage, 'error');
    }
}

// 애플리케이션 시작
const devConnectApp = new DevConnectApp();

// 전역 에러 핸들러
window.addEventListener('error', (e) => {
    devConnectApp.handleError(e.error, 'Global Error');
});

window.addEventListener('unhandledrejection', (e) => {
    devConnectApp.handleError(e.reason, 'Unhandled Promise Rejection');
});

// 전역 객체로 내보내기
window.devConnectApp = devConnectApp;

console.log('DevConnect 메인 스크립트가 로드되었습니다.');