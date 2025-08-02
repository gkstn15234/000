// DevConnect 메인 애플리케이션

class DevConnectApp {
    constructor() {
        this.version = '1.0.0';
        this.features = {
            codeSharing: false,
            videoMeeting: true,
            mentoring: true,
            projectShowcase: true,
            dynamicChannels: true,
            realTimeChat: true
        };
        
        this.channels = [];
        this.channelSubscription = null;
        
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
        this.loadChannels();
        this.subscribeToChannelUpdates();
        
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
        const createZoomMeetingBtn = document.getElementById('createZoomMeetingBtn');
        const closeMeetingModal = document.getElementById('closeMeetingModal');
        const meetingType = document.getElementById('meetingType');
        
        if (createZoomMeetingBtn) {
            createZoomMeetingBtn.addEventListener('click', () => this.createZoomMeeting());
        }
        
        if (closeMeetingModal) {
            closeMeetingModal.addEventListener('click', () => this.closeVideoCallModal());
        }
        
        if (meetingType) {
            meetingType.addEventListener('change', () => this.toggleScheduledOptions());
        }
        
        // 멘토링 버튼
        const mentoringBtn = document.getElementById('mentoringBtn');
        const closeMentoringModal = document.getElementById('closeMentoringModal');
        const submitQuestionBtn = document.getElementById('submitQuestionBtn');
        
        if (mentoringBtn) {
            mentoringBtn.addEventListener('click', () => this.openMentoringModal());
        }
        
        if (closeMentoringModal) {
            closeMentoringModal.addEventListener('click', () => this.closeMentoringModal());
        }
        
        if (submitQuestionBtn) {
            submitQuestionBtn.addEventListener('click', () => this.submitQuestion());
        }
        
        // 스토어 버튼
        const storeBtn = document.getElementById('storeBtn');
        const closeStoreModal = document.getElementById('closeStoreModal');
        const sellCodeBtn = document.getElementById('sellCodeBtn');
        
        if (storeBtn) {
            storeBtn.addEventListener('click', () => this.openStoreModal());
        }
        
        if (closeStoreModal) {
            closeStoreModal.addEventListener('click', () => this.closeStoreModal());
        }
        
        if (sellCodeBtn) {
            sellCodeBtn.addEventListener('click', () => this.sellCode());
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
    async createNewChannel() {
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

        // 중복 채널 검사
        if (this.channels.some(ch => ch.name === channelName)) {
            if (window.authManager) {
                authManager.showToast('이미 존재하는 채널명입니다.', 'warning');
            }
            return;
        }

        try {
            // 데이터베이스에 채널 생성
            const newChannel = await SupabaseUtils.createChannel({
                name: channelName,
                description: `${channelName} 채널에서 자유롭게 대화하세요!`,
                icon: 'fas fa-hashtag',
                color: 'text-primary'
            });
            
            // 입력 필드 초기화
            input.value = '';
            
            if (window.authManager) {
                authManager.showToast(`'${channelName}' 채널이 생성되었습니다!`, 'success');
            }
            
        } catch (error) {
            console.error('채널 생성 실패:', error);
            if (window.authManager) {
                authManager.showToast('채널 생성에 실패했습니다.', 'error');
            }
        }
    }

    // 채널 목록 로드
    async loadChannels() {
        try {
            this.channels = await SupabaseUtils.getChannels();
            this.renderChannelList();
        } catch (error) {
            console.error('채널 로드 실패:', error);
        }
    }

    // 채널 목록 렌더링
    renderChannelList() {
        const channelList = document.querySelector('.space-y-2');
        if (!channelList) return;

        // 기존 채널 버튼들 제거 (기본 채널 제외)
        const existingButtons = channelList.querySelectorAll('.channel-btn:not(.channel-active)');
        existingButtons.forEach(btn => btn.remove());

        // 데이터베이스에서 가져온 채널들 추가
        this.channels.forEach(channel => {
            if (channel.id !== 'general') { // 일반 채널은 이미 HTML에 있음
                this.addChannelToList(channel);
            }
        });
    }

    // 채널 목록에 추가
    addChannelToList(channel) {
        const channelList = document.querySelector('.space-y-2');
        if (!channelList) return;

        const channelButton = document.createElement('button');
        channelButton.className = 'channel-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors';
        channelButton.dataset.channel = channel.id;
        
        const messageCount = this.getChannelMessageCount(channel.id);
        
        channelButton.innerHTML = `
            <i class="${channel.icon} ${channel.color} mr-2"></i>${channel.name}
            <span class="float-right text-sm text-gray-500">${messageCount}</span>
        `;
        
        // 채널 클릭 이벤트
        channelButton.addEventListener('click', () => {
            this.switchChannel(channel.id, channel.name);
        });
        
        channelList.appendChild(channelButton);
    }

    // 채널 메시지 수 가져오기
    getChannelMessageCount(channelId) {
        // 실제 구현에서는 데이터베이스에서 가져옴
        return Math.floor(Math.random() * 10);
    }

    // 채널 업데이트 구독
    subscribeToChannelUpdates() {
        this.channelSubscription = SupabaseUtils.subscribeToChannels((payload) => {
            console.log('채널 업데이트:', payload);
            
            if (payload.eventType === 'INSERT') {
                this.channels.push(payload.new);
                this.addChannelToList(payload.new);
            }
            // 다른 이벤트 타입들도 처리 가능
        });
    }

    // 채널 전환
    switchChannel(channelId, channelName) {
        const currentChannelElement = document.getElementById('currentChannel');
        if (currentChannelElement) {
            currentChannelElement.textContent = channelName || channelId;
        }
        
        // 모든 채널 버튼에서 active 클래스 제거
        document.querySelectorAll('.channel-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white', 'channel-active');
        });
        
        // 현재 채널 버튼에 active 클래스 추가
        const targetButton = document.querySelector(`[data-channel="${channelId}"]`);
        if (targetButton) {
            targetButton.classList.add('bg-primary', 'text-white', 'channel-active');
        }
        
        // 채팅 매니저에 채널 전환 알림
        if (window.chatManager) {
            chatManager.switchChannel(channelId);
        }
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

    // 예약 옵션 토글
    toggleScheduledOptions() {
        const meetingType = document.getElementById('meetingType').value;
        const scheduledOptions = document.getElementById('scheduledOptions');
        
        if (meetingType === 'scheduled') {
            scheduledOptions.classList.remove('hidden');
        } else {
            scheduledOptions.classList.add('hidden');
        }
    }

    // Zoom 미팅 생성
    async createZoomMeeting() {
        const title = document.getElementById('meetingTitle').value || 'DevConnect 미팅';
        const meetingType = document.getElementById('meetingType').value;
        const waitingRoom = document.getElementById('waitingRoom').checked;
        const recordMeeting = document.getElementById('recordMeeting').checked;
        
        try {
            // 실제 Zoom API 호출 대신 목업 데이터 사용
            const mockMeetingData = {
                id: Date.now(),
                join_url: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`,
                password: Math.random().toString(36).substring(2, 8),
                topic: title,
                type: meetingType === 'instant' ? 1 : 2,
                settings: {
                    waiting_room: waitingRoom,
                    auto_recording: recordMeeting ? 'cloud' : 'none'
                }
            };
            
            // 채팅에 미팅 정보 공유
            if (window.chatManager) {
                const meetingMessage = `🎥 **${title}**\n\n🔗 미팅 링크: ${mockMeetingData.join_url}\n🔐 비밀번호: ${mockMeetingData.password}\n⏰ 유형: ${meetingType === 'instant' ? '즉시 미팅' : '예약 미팅'}\n\n지금 참여하세요!`;
                chatManager.sendMessage(meetingMessage);
            }
            
            // 모달 닫기
            this.closeVideoCallModal();
            
            // 입력 필드 초기화
            document.getElementById('meetingTitle').value = '';
            
            if (window.authManager) {
                authManager.showToast('Zoom 미팅이 생성되었습니다!', 'success');
            }
            
            // 새 탭에서 미팅 열기
            window.open(mockMeetingData.join_url, '_blank');
            
        } catch (error) {
            console.error('Zoom 미팅 생성 실패:', error);
            if (window.authManager) {
                authManager.showToast('미팅 생성에 실패했습니다.', 'error');
            }
        }
    }

    // 멘토링 모달 열기
    openMentoringModal() {
        const modal = document.getElementById('mentoringModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // 멘토링 모달 닫기
    closeMentoringModal() {
        const modal = document.getElementById('mentoringModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 질문 제출
    async submitQuestion() {
        const title = document.getElementById('questionTitle').value;
        const techStack = document.getElementById('techStack').value;
        const content = document.getElementById('questionContent').value;
        
        if (!title.trim() || !content.trim()) {
            if (window.authManager) {
                authManager.showToast('제목과 내용을 모두 입력해주세요.', 'warning');
            }
            return;
        }
        
        try {
            // 채팅에 질문 올리기
            if (window.chatManager) {
                const questionMessage = `❓ **멘토링 질문**\n\n📝 **제목:** ${title}\n${techStack ? `🛠️ **기술:** ${techStack}\n` : ''}\n**내용:**\n${content}\n\n답변 부탁드립니다! 🙏`;
                chatManager.sendMessage(questionMessage);
            }
            
            // 모달 닫기
            this.closeMentoringModal();
            
            // 입력 필드 초기화
            document.getElementById('questionTitle').value = '';
            document.getElementById('techStack').value = '';
            document.getElementById('questionContent').value = '';
            
            if (window.authManager) {
                authManager.showToast('질문이 올라갔습니다!', 'success');
            }
            
        } catch (error) {
            console.error('질문 제출 실패:', error);
            if (window.authManager) {
                authManager.showToast('질문 제출에 실패했습니다.', 'error');
            }
        }
    }

    // 스토어 모달 열기
    openStoreModal() {
        const modal = document.getElementById('storeModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // 스토어 모달 닫기
    closeStoreModal() {
        const modal = document.getElementById('storeModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 코드 판매
    async sellCode() {
        const repoUrl = document.getElementById('repoUrl').value;
        const title = document.getElementById('codeTitle').value;
        const price = document.getElementById('codePrice').value;
        const description = document.getElementById('codeDescription').value;
        
        if (!repoUrl.trim() || !title.trim() || !price) {
            if (window.authManager) {
                authManager.showToast('모든 필드를 입력해주세요.', 'warning');
            }
            return;
        }
        
        // GitHub URL 유효성 검사
        if (!repoUrl.includes('github.com')) {
            if (window.authManager) {
                authManager.showToast('유효한 GitHub URL을 입력해주세요.', 'warning');
            }
            return;
        }
        
        try {
            // 채팅에 코드 판매 공지
            if (window.chatManager) {
                const storeMessage = `💼 **코드 스토어 등록**\n\n💻 **제목:** ${title}\n💰 **가격:** ₩${Number(price).toLocaleString()}\n🔗 **GitHub:** ${repoUrl}\n\n**설명:**\n${description}\n\n관심 있으시면 DM 또는 댄글 남겨주세요! 🚀`;
                chatManager.sendMessage(storeMessage);
            }
            
            // 입력 필드 초기화
            document.getElementById('repoUrl').value = '';
            document.getElementById('codeTitle').value = '';
            document.getElementById('codePrice').value = '';
            document.getElementById('codeDescription').value = '';
            
            if (window.authManager) {
                authManager.showToast('코드가 스토어에 등록되었습니다!', 'success');
            }
            
        } catch (error) {
            console.error('코드 등록 실패:', error);
            if (window.authManager) {
                authManager.showToast('코드 등록에 실패했습니다.', 'error');
            }
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