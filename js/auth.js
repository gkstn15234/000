// 인증 관리 시스템

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.init();
    }

    // 초기화
    async init() {
        // 인증 상태 변화 감지
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.onSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.onSignOut();
            }

            // 리스너들에게 알림
            this.authListeners.forEach(listener => listener(event, session));
        });

        // 페이지 로드시 현재 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            this.currentUser = user;
            this.onSignIn(user);
        }
    }

    // 인증 상태 변화 리스너 추가
    addAuthListener(callback) {
        this.authListeners.push(callback);
    }

    // 인증 상태 변화 리스너 제거
    removeAuthListener(callback) {
        const index = this.authListeners.indexOf(callback);
        if (index > -1) {
            this.authListeners.splice(index, 1);
        }
    }

    // 이메일/비밀번호 회원가입
    async signUp(email, password, userData = {}) {
        try {
            this.showLoading(true);
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: userData.name || email.split('@')[0],
                        ...userData
                    }
                }
            });

            if (error) throw error;

            this.showToast('회원가입이 완료되었습니다! 이메일을 확인해주세요.', 'success');
            return data;

        } catch (error) {
            console.error('회원가입 실패:', error);
            this.showToast(error.message || '회원가입에 실패했습니다.', 'error');
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    // 이메일/비밀번호 로그인
    async signIn(email, password) {
        try {
            this.showLoading(true);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.showToast('로그인되었습니다!', 'success');
            return data;

        } catch (error) {
            console.error('로그인 실패:', error);
            this.showToast(error.message || '로그인에 실패했습니다.', 'error');
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    // GitHub OAuth 로그인
    async signInWithGitHub() {
        try {
            this.showLoading(true);
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;
            
            return data;

        } catch (error) {
            console.error('GitHub 로그인 실패:', error);
            this.showToast('GitHub 로그인에 실패했습니다.', 'error');
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    // 로그아웃
    async signOut() {
        try {
            this.showLoading(true);
            
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.showToast('로그아웃되었습니다.', 'info');

        } catch (error) {
            console.error('로그아웃 실패:', error);
            this.showToast('로그아웃에 실패했습니다.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 로그인 후 처리
    onSignIn(user) {
        console.log('사용자 로그인:', user);
        
        // UI 업데이트
        this.updateAuthUI(true, user);
        
        // 사용자 프로필 정보 로드
        this.loadUserProfile(user);
        
        // 대시보드 표시
        this.showDashboard();
        
        // 모달 닫기
        this.closeModals();
    }

    // 로그아웃 후 처리
    onSignOut() {
        console.log('사용자 로그아웃');
        
        // UI 업데이트
        this.updateAuthUI(false);
        
        // 웰컴 섹션 표시
        this.showWelcome();
    }

    // 인증 UI 업데이트
    updateAuthUI(isAuthenticated, user = null) {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');

        if (isAuthenticated && user) {
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');
            
            // 사용자 정보 표시
            const userName = document.getElementById('userName');
            const userAvatar = document.getElementById('userAvatar');
            
            userName.textContent = user.user_metadata?.name || user.email.split('@')[0];
            
            if (user.user_metadata?.avatar_url) {
                userAvatar.src = user.user_metadata.avatar_url;
            } else {
                userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.textContent)}&background=3b82f6&color=fff`;
            }
        } else {
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    // 사용자 프로필 로드
    async loadUserProfile(user) {
        try {
            // 데이터베이스에서 사용자 프로필 정보 가져오기
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // No rows found 에러가 아닌 경우
                throw error;
            }

            if (!data) {
                // 사용자 프로필이 없으면 생성
                await this.createUserProfile(user);
            }

        } catch (error) {
            console.error('사용자 프로필 로드 실패:', error);
        }
    }

    // 사용자 프로필 생성
    async createUserProfile(user) {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url,
                    github_username: user.user_metadata?.user_name
                });

            if (error) throw error;
            
            console.log('사용자 프로필이 생성되었습니다.');

        } catch (error) {
            console.error('사용자 프로필 생성 실패:', error);
        }
    }

    // 대시보드 표시
    showDashboard() {
        const welcomeSection = document.getElementById('welcomeSection');
        const dashboardSection = document.getElementById('dashboardSection');
        
        welcomeSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
    }

    // 웰컴 섹션 표시
    showWelcome() {
        const welcomeSection = document.getElementById('welcomeSection');
        const dashboardSection = document.getElementById('dashboardSection');
        
        welcomeSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }

    // 모달 닫기
    closeModals() {
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        
        loginModal.classList.add('hidden');
        signupModal.classList.add('hidden');
    }

    // 로딩 표시
    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

    // 토스트 알림 표시
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type} mb-2`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="ml-4 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // 현재 사용자 반환
    getCurrentUser() {
        return this.currentUser;
    }

    // 로그인 상태 확인
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// 전역 AuthManager 인스턴스 생성
const authManager = new AuthManager();

// DOM 로드 완료 후 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 버튼
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('hidden');
    });

    // 회원가입 버튼
    document.getElementById('signupBtn').addEventListener('click', () => {
        document.getElementById('signupModal').classList.remove('hidden');
    });

    // GitHub으로 시작하기 버튼
    document.getElementById('getStartedBtn').addEventListener('click', () => {
        authManager.signInWithGitHub();
    });

    // 로그인 폼
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        await authManager.signIn(email, password);
    });

    // 회원가입 폼
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        await authManager.signUp(email, password, { name });
    });

    // GitHub 로그인 버튼
    document.getElementById('githubLoginBtn').addEventListener('click', () => {
        authManager.signInWithGitHub();
    });

    // 로그아웃 버튼
    document.getElementById('logoutBtn').addEventListener('click', () => {
        authManager.signOut();
    });

    // 모달 닫기 버튼들
    document.getElementById('closeLoginModal').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });

    document.getElementById('closeSignupModal').addEventListener('click', () => {
        document.getElementById('signupModal').classList.add('hidden');
    });

    // 모달 전환 버튼들
    document.getElementById('showSignupBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('signupModal').classList.remove('hidden');
    });

    document.getElementById('showLoginBtn').addEventListener('click', () => {
        document.getElementById('signupModal').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('hidden');
    });

    // 사용자 메뉴 드롭다운
    document.getElementById('userMenuBtn').addEventListener('click', () => {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('hidden');
    });

    // 모달 외부 클릭시 닫기
    document.getElementById('loginModal').addEventListener('click', (e) => {
        if (e.target.id === 'loginModal') {
            document.getElementById('loginModal').classList.add('hidden');
        }
    });

    document.getElementById('signupModal').addEventListener('click', (e) => {
        if (e.target.id === 'signupModal') {
            document.getElementById('signupModal').classList.add('hidden');
        }
    });

    // 페이지 클릭시 드롭다운 닫기
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('userMenu');
        const dropdown = document.getElementById('userDropdown');
        
        if (!userMenu.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
});

// 전역 객체로 내보내기
window.authManager = authManager;