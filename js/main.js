// DevConnect 메인 애플리케이션

class DevConnectApp {
    constructor() {
        this.version = '1.0.0';
        this.features = {
            codeSharing: true,
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
        // 코드 공유 버튼
        const codeShareBtn = document.querySelector('button:has(i.fa-code)');
        if (codeShareBtn) {
            codeShareBtn.addEventListener('click', () => this.openCodeShareModal());
        }

        // 화상 회의 버튼
        const videoMeetBtn = document.querySelector('button:has(i.fa-video)');
        if (videoMeetBtn) {
            videoMeetBtn.addEventListener('click', () => this.startVideoMeeting());
        }

        // 멘토링 버튼
        const mentoringBtn = document.querySelector('button:has(i.fa-users)');
        if (mentoringBtn) {
            mentoringBtn.addEventListener('click', () => this.openMentoringModal());
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

    // 코드 공유 모달 열기
    openCodeShareModal() {
        if (!authManager.isAuthenticated()) {
            authManager.showToast('로그인이 필요합니다.', 'warning');
            return;
        }

        const modal = this.createCodeShareModal();
        document.body.appendChild(modal);
    }

    // 코드 공유 모달 생성
    createCodeShareModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">코드 공유</h2>
                    <button class="close-modal text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">제목</label>
                        <input type="text" id="codeTitle" class="w-full px-3 py-2 border rounded-lg" placeholder="코드 제목을 입력하세요">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">언어</label>
                        <select id="codeLanguage" class="w-full px-3 py-2 border rounded-lg">
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="sql">SQL</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">코드</label>
                        <textarea id="codeContent" rows="15" class="w-full px-3 py-2 border rounded-lg font-mono text-sm" placeholder="코드를 입력하세요..."></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">설명</label>
                        <textarea id="codeDescription" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="코드에 대한 설명을 입력하세요..."></textarea>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button id="shareCodeBtn" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                            공유하기
                        </button>
                        <button class="close-modal px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            취소
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 이벤트 리스너 추가
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelector('#shareCodeBtn').addEventListener('click', () => {
            this.shareCode(modal);
        });

        return modal;
    }

    // 코드 공유 실행
    async shareCode(modal) {
        const title = modal.querySelector('#codeTitle').value;
        const language = modal.querySelector('#codeLanguage').value;
        const content = modal.querySelector('#codeContent').value;
        const description = modal.querySelector('#codeDescription').value;

        if (!content.trim()) {
            authManager.showToast('코드를 입력해주세요.', 'warning');
            return;
        }

        try {
            const codeMessage = `**${title || '코드 공유'}**\n\n${description}\n\n\`\`\`${language}\n${content}\n\`\`\``;
            await chatManager.sendMessage(codeMessage);
            
            modal.remove();
            authManager.showToast('코드가 공유되었습니다!', 'success');
        } catch (error) {
            console.error('코드 공유 실패:', error);
            authManager.showToast('코드 공유에 실패했습니다.', 'error');
        }
    }

    // 화상 회의 시작
    startVideoMeeting() {
        if (!authManager.isAuthenticated()) {
            authManager.showToast('로그인이 필요합니다.', 'warning');
            return;
        }

        // Zoom 통합 또는 기본 WebRTC 구현
        this.createZoomMeeting();
    }

    // Zoom 미팅 생성
    createZoomMeeting() {
        // 실제 구현에서는 Zoom API 사용
        const meetingUrl = `https://zoom.us/j/${Date.now()}`;
        
        authManager.showToast('화상회의 링크가 생성되었습니다!', 'success');
        
        // 채팅에 미팅 링크 공유
        const meetingMessage = `🎥 **화상회의 시작**\n\n미팅 링크: ${meetingUrl}\n\n지금 참여하세요!`;
        chatManager.sendMessage(meetingMessage);
        
        // 새 탭에서 미팅 열기
        window.open(meetingUrl, '_blank');
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