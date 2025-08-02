// 실시간 채팅 시스템

class ChatManager {
    constructor() {
        this.currentChannel = null; // 동적으로 설정됨
        this.messages = {};
        this.subscriptions = {};
        this.messageContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        
        this.init();
    }

    // 초기화
    init() {
        // DOM 요소 참조
        this.messageContainer = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessageBtn');

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 인증 상태 변화 감지
        authManager.addAuthListener((event, session) => {
            if (event === 'SIGNED_IN') {
                // 로그인 시 현재 채널의 메시지 로드
                if (this.currentChannel) {
                    setTimeout(() => {
                        this.loadMessages(this.currentChannel);
                        this.subscribeToChannel(this.currentChannel);
                    }, 500);
                }
            } else if (event === 'SIGNED_OUT') {
                this.clearMessages();
                this.unsubscribeFromAllChannels();
            }
        });
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 메시지 전송 버튼
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // 메시지 입력 시 Enter 키
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 채널 버튼들
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('channel-btn')) {
                const channel = e.target.dataset.channel;
                this.switchChannel(channel);
            }
        });
    }

    // 채널 전환
    async switchChannel(channel) {
        // 이전 채널 구독 해제
        this.unsubscribeFromChannel(this.currentChannel);
        
        // 새 채널 설정
        this.currentChannel = channel;
        
        // UI 업데이트
        this.updateChannelUI(channel);
        
        // 메시지 로드
        await this.loadMessages(channel);
        
        // 새 채널 구독
        this.subscribeToChannel(channel);
    }

    // 채널 UI 업데이트
    updateChannelUI(channel) {
        // 채널 이름 매핑
        const channelNames = {
            'general': '일반',
            'javascript': 'JavaScript',
            'python': 'Python',
            'react': 'React',
            'nodejs': 'Node.js',
            'ai': 'AI/ML'
        };
        
        // 현재 채널 표시 업데이트
        document.getElementById('currentChannel').textContent = channelNames[channel] || channel;
        
        // 채널 버튼 활성화 상태 업데이트
        document.querySelectorAll('.channel-btn').forEach(btn => {
            btn.classList.remove('active', 'channel-active');
            if (btn.dataset.channel === channel) {
                btn.classList.add('active', 'channel-active');
            }
        });
    }

    // 메시지 로드
    async loadMessages(channel) {
        try {
            const messages = await SupabaseUtils.getMessages(channel, 50);
            this.messages[channel] = messages;
            this.renderMessages(messages);
        } catch (error) {
            console.error('메시지 로드 실패:', error);
            authManager.showToast('메시지를 불러오는데 실패했습니다.', 'error');
        }
    }

    // 메시지 렌더링
    renderMessages(messages) {
        if (!this.messageContainer) return;

        this.messageContainer.innerHTML = '';

        messages.forEach(message => {
            this.renderMessage(message);
        });

        // 스크롤을 맨 아래로
        this.scrollToBottom();
    }

    // 단일 메시지 렌더링
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item p-4 hover:bg-gray-50 transition-colors';
        messageElement.dataset.messageId = message.id;

        const user = message.user || { name: '익명', avatar_url: null };
        const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
        
        // 시간 포맷팅
        const timestamp = new Date(message.created_at);
        const timeString = this.formatTimestamp(timestamp);

        // 메시지 내용 처리
        let messageContent = this.processMessageContent(message.content, message.code_language);

        messageElement.innerHTML = `
            <div class="flex space-x-3">
                <img src="${avatarUrl}" alt="${user.name}" class="user-avatar flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="font-semibold text-gray-900">${user.name}</span>
                        <span class="message-timestamp">${timeString}</span>
                    </div>
                    <div class="message-content text-gray-700">
                        ${messageContent}
                    </div>
                    <div class="mt-2 flex items-center space-x-2">
                        <button class="emoji-reaction" data-emoji="👍" data-message-id="${message.id}" title="좋아요">
                            👍 <span class="reaction-count">${Math.floor(Math.random() * 5)}</span>
                        </button>
                        <button class="emoji-reaction" data-emoji="❤️" data-message-id="${message.id}" title="하트">
                            ❤️ <span class="reaction-count">${Math.floor(Math.random() * 3)}</span>
                        </button>
                        <button class="emoji-reaction" data-emoji="😊" data-message-id="${message.id}" title="웃음">
                            😊 <span class="reaction-count">${Math.floor(Math.random() * 2)}</span>
                        </button>
                        <button class="text-gray-400 hover:text-gray-600 text-sm ml-2" title="답글">
                            <i class="fas fa-reply"></i> 답글
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.messageContainer.appendChild(messageElement);
        
        // 이모지 반응 이벤트 리스너 추가
        messageElement.querySelectorAll('.emoji-reaction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleEmojiReaction(e);
            });
        });
    }

    // 메시지 내용 처리 (마크다운, 코드 블록 등)
    processMessageContent(content, codeLanguage = null) {
        // 코드 블록 처리
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `
                <div class="code-block">
                    <div class="code-language">${language}</div>
                    <pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
                </div>
            `;
        });

        // 인라인 코드 처리
        content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // 링크 처리
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-primary hover:underline">$1</a>');

        // 사용자 멘션 처리
        content = content.replace(/@(\w+)/g, '<span class="user-mention">@$1</span>');

        // 줄바꿈 처리
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 시간 포맷팅
    formatTimestamp(date) {
        const now = new Date();
        const diff = now - date;
        
        // 1분 미만
        if (diff < 60000) {
            return '방금 전';
        }
        
        // 1시간 미만
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}분 전`;
        }
        
        // 오늘
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        // 어제
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `어제 ${date.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
        
        // 그 외
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 메시지 전송
    async sendMessage() {
        console.log('sendMessage 함수 호출됨');
        
        const content = this.messageInput.value.trim();
        console.log('메시지 내용:', content);
        console.log('현재 채널:', this.currentChannel);
        
        if (!content) {
            console.log('빈 메시지, 전송 취소');
            return;
        }

        if (!authManager.isAuthenticated()) {
            console.log('인증되지 않은 사용자');
            authManager.showToast('로그인이 필요합니다.', 'warning');
            return;
        }

        if (!this.currentChannel) {
            console.log('채널이 설정되지 않음');
            authManager.showToast('채널을 선택해주세요.', 'warning');
            return;
        }

        try {
            console.log('메시지 전송 시작...');
            
            // 메시지 타입 감지
            let messageType = 'text';
            let codeLanguage = null;

            if (content.includes('```')) {
                messageType = 'code';
                const codeMatch = content.match(/```(\w+)?/);
                if (codeMatch && codeMatch[1]) {
                    codeLanguage = codeMatch[1];
                }
            }

            // 메시지 전송
            const result = await SupabaseUtils.sendMessage(content, this.currentChannel, messageType, codeLanguage);
            console.log('메시지 전송 결과:', result);
            
            // 입력창 초기화
            this.messageInput.value = '';
            
            // 성공 토스트
            authManager.showToast('메시지가 전송되었습니다.', 'success');
            
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            authManager.showToast('메시지 전송에 실패했습니다.', 'error');
        }
    }

    // 채널 구독
    subscribeToChannel(channel) {
        if (this.subscriptions[channel]) {
            this.subscriptions[channel].unsubscribe();
        }

        this.subscriptions[channel] = SupabaseUtils.subscribeToMessages(
            channel, 
            (payload) => {
                console.log('새 메시지 수신:', payload);
                
                if (payload.eventType === 'INSERT') {
                    this.handleNewMessage(payload.new);
                }
            }
        );
    }

    // 채널 구독 해제
    unsubscribeFromChannel(channel) {
        if (this.subscriptions[channel]) {
            this.subscriptions[channel].unsubscribe();
            delete this.subscriptions[channel];
        }
    }

    // 모든 채널 구독 해제
    unsubscribeFromAllChannels() {
        Object.keys(this.subscriptions).forEach(channel => {
            this.unsubscribeFromChannel(channel);
        });
    }

    // 새 메시지 처리
    handleNewMessage(message) {
        // 현재 채널의 메시지인 경우에만 표시
        if (message.channel === this.currentChannel) {
            // 메시지 목록에 추가
            if (!this.messages[this.currentChannel]) {
                this.messages[this.currentChannel] = [];
            }
            this.messages[this.currentChannel].push(message);

            // 화면에 렌더링
            this.renderMessage(message);
            
            // 스크롤을 맨 아래로
            this.scrollToBottom();

            // 알림 표시 (자신의 메시지가 아닌 경우)
            const currentUser = authManager.getCurrentUser();
            if (currentUser && message.user_id !== currentUser.id) {
                this.showMessageNotification(message);
            }
        }
    }

    // 메시지 알림 표시
    showMessageNotification(message) {
        // 브라우저 알림 권한 확인
        if (Notification.permission === 'granted') {
            const user = message.user || { name: '익명' };
            new Notification(`새 메시지 - ${user.name}`, {
                body: message.content.substring(0, 100),
                icon: '/favicon.ico'
            });
        }
    }

    // 스크롤을 맨 아래로
    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    // 이모지 반응 처리
    handleEmojiReaction(event) {
        const button = event.target.closest('.emoji-reaction');
        if (!button) return;
        
        const emoji = button.dataset.emoji;
        const messageId = button.dataset.messageId;
        const countSpan = button.querySelector('.reaction-count');
        
        // 현재 카운트 가져오기
        let currentCount = parseInt(countSpan.textContent) || 0;
        
        // 버튼이 이미 활성화되어 있는지 확인
        if (button.classList.contains('active')) {
            // 반응 제거
            currentCount = Math.max(0, currentCount - 1);
            button.classList.remove('active');
            authManager.showToast(`${emoji} 반응을 제거했습니다.`, 'info');
        } else {
            // 반응 추가
            currentCount += 1;
            button.classList.add('active');
            authManager.showToast(`${emoji} 반응을 추가했습니다!`, 'success');
        }
        
        // 카운트 업데이트
        countSpan.textContent = currentCount;
        
        console.log(`이모지 반응: ${emoji} on message ${messageId}, count: ${currentCount}`);
    }

    // 메시지 초기화
    clearMessages() {
        if (this.messageContainer) {
            this.messageContainer.innerHTML = '<p class="text-gray-500 text-center py-8">로그인 후 메시지를 확인할 수 있습니다.</p>';
        }
        this.messages = {};
    }

    // 알림 권한 요청
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }
}

// DOM 로드 완료 후 ChatManager 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 전역 객체로 설정
    window.chatManager = new ChatManager();
    
    // 알림 권한 요청
    window.chatManager.requestNotificationPermission();
    
    console.log('채팅 시스템이 초기화되었습니다.');
});

// 즉시 초기화 (백업)
if (document.readyState === 'loading') {
    // DOM이 로딩 중이면 DOMContentLoaded 대기
} else {
    // 이미 로드 완료되었으면 즉시 초기화
    window.chatManager = new ChatManager();
    console.log('채팅 시스템이 즉시 초기화되었습니다.');
}