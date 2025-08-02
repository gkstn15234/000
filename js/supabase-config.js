// Supabase 설정 및 초기화

// Supabase 프로젝트 설정 (실제 사용시 환경변수로 관리해야 함)
const SUPABASE_URL = 'https://pgtysdyzoibhylwysbet.supabase.co'; // 실제 Supabase URL로 변경 필요
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndHlzZHl6b2liaHlsd3lzYmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQzMjQsImV4cCI6MjA2OTcyMDMyNH0.TvNuMZTso78AeRoiqsGeHvd4CbQIIVoTuz9HD0PnmmU'; // 실제 anon key로 변경 필요

// 개발 환경에서는 로컬 Supabase 사용 가능
// const SUPABASE_URL = 'http://localhost:54321';
// const SUPABASE_ANON_KEY = 'your-local-anon-key';

// Supabase 클라이언트 초기화
let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase 클라이언트가 성공적으로 초기화되었습니다.');
} catch (error) {
    console.error('Supabase 클라이언트 초기화 실패:', error);
    // 임시로 목업 데이터 사용
    supabase = createMockSupabase();
}

// 목업 Supabase (개발/테스트용)
function createMockSupabase() {
    const mockUsers = [
        { id: '1', email: 'test@example.com', user_metadata: { name: '테스트 사용자' } }
    ];
    
    const mockMessages = [
        {
            id: '1',
            content: '안녕하세요! DevConnect에 오신 것을 환영합니다! 🎉',
            user_id: '1',
            channel: 'general',
            created_at: new Date().toISOString(),
            user: { name: '관리자', avatar_url: null }
        },
        {
            id: '2',
            content: '```javascript\nconsole.log("Hello, World!");\n```\n첫 번째 코드 공유입니다!',
            user_id: '1',
            channel: 'javascript',
            created_at: new Date(Date.now() - 300000).toISOString(),
            user: { name: '김개발', avatar_url: null }
        },
        {
            id: '3',
            content: 'React Hooks에 대해 질문이 있어요. useEffect 사용법을 알려주세요!',
            user_id: '1',
            channel: 'react',
            created_at: new Date(Date.now() - 600000).toISOString(),
            user: { name: '박초보', avatar_url: null }
        }
    ];
    
    let currentUser = null;
    const authListeners = [];
    
    return {
        auth: {
            signUp: async ({ email, password, options = {} }) => {
                console.log('Mock signup:', email);
                const user = {
                    id: Date.now().toString(),
                    email: email,
                    user_metadata: options.data || { name: email.split('@')[0] }
                };
                currentUser = user;
                
                // 인증 상태 변경 알림
                setTimeout(() => {
                    authListeners.forEach(callback => callback('SIGNED_IN', { user }));
                }, 100);
                
                return { data: { user }, error: null };
            },
            
            signInWithPassword: async ({ email, password }) => {
                console.log('Mock signin:', email);
                const user = mockUsers.find(u => u.email === email) || {
                    id: Date.now().toString(),
                    email: email,
                    user_metadata: { name: email.split('@')[0] }
                };
                currentUser = user;
                
                // 인증 상태 변경 알림
                setTimeout(() => {
                    authListeners.forEach(callback => callback('SIGNED_IN', { user }));
                }, 100);
                
                return { data: { user }, error: null };
            },
            
            signOut: async () => {
                console.log('Mock signout');
                currentUser = null;
                
                // 인증 상태 변경 알림
                setTimeout(() => {
                    authListeners.forEach(callback => callback('SIGNED_OUT', null));
                }, 100);
                
                return { error: null };
            },
            
            getUser: async () => {
                return { data: { user: currentUser }, error: null };
            },
            
            onAuthStateChange: (callback) => {
                authListeners.push(callback);
                
                // 초기 상태 전송
                setTimeout(() => {
                    callback(currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', 
                            currentUser ? { user: currentUser } : null);
                }, 10);
                
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                const index = authListeners.indexOf(callback);
                                if (index > -1) authListeners.splice(index, 1);
                            }
                        }
                    }
                };
            }
        },
        
        from: (table) => ({
            select: async (columns = '*') => {
                console.log(`Mock select from ${table}`);
                if (table === 'messages') {
                    return { data: mockMessages, error: null };
                }
                return { data: [], error: null };
            },
            
            insert: async (data) => {
                console.log(`Mock insert into ${table}:`, data);
                if (table === 'messages') {
                    const newMessage = {
                        ...data,
                        id: Date.now().toString(),
                        created_at: new Date().toISOString(),
                        user: currentUser ? {
                            name: currentUser.user_metadata.name || currentUser.email.split('@')[0],
                            avatar_url: null
                        } : { name: '익명', avatar_url: null }
                    };
                    mockMessages.push(newMessage);
                    return { data: [newMessage], error: null };
                }
                return { data: [data], error: null };
            },
            
            eq: function(column, value) {
                this._filters = this._filters || {};
                this._filters[column] = value;
                return this;
            },
            
            order: function(column, options = {}) {
                this._order = { column, ...options };
                return this;
            }
        }),
        
        channel: (name) => ({
            on: (event, filter, callback) => {
                console.log(`Mock channel subscription: ${name}, ${event}`);
                return this;
            },
            subscribe: () => {
                console.log('Mock channel subscribed');
                return { unsubscribe: () => console.log('Mock channel unsubscribed') };
            }
        })
    };
}

// 데이터베이스 테이블 스키마 (참고용)
const DATABASE_SCHEMA = {
    users: {
        id: 'uuid primary key',
        email: 'text unique',
        name: 'text',
        avatar_url: 'text',
        github_username: 'text',
        bio: 'text',
        skills: 'text[]',
        created_at: 'timestamp'
    },
    
    messages: {
        id: 'uuid primary key',
        content: 'text',
        user_id: 'uuid references users(id)',
        channel: 'text',
        message_type: 'text default "normal"',
        code_language: 'text',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    
    channels: {
        id: 'uuid primary key',
        name: 'text unique',
        description: 'text',
        is_private: 'boolean default false',
        created_by: 'uuid references users(id)',
        created_at: 'timestamp'
    },
    
    projects: {
        id: 'uuid primary key',
        title: 'text',
        description: 'text',
        github_url: 'text',
        demo_url: 'text',
        tech_stack: 'text[]',
        user_id: 'uuid references users(id)',
        created_at: 'timestamp'
    },
    
    user_reactions: {
        id: 'uuid primary key',
        message_id: 'uuid references messages(id)',
        user_id: 'uuid references users(id)',
        emoji: 'text',
        created_at: 'timestamp'
    }
};

// Supabase 유틸리티 함수들
const SupabaseUtils = {
    // 현재 사용자 정보 가져오기
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
            return null;
        }
    },
    
    // 사용자 프로필 업데이트
    async updateUserProfile(userId, profileData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert({ id: userId, ...profileData })
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            throw error;
        }
    },
    
    // 메시지 가져오기
    async getMessages(channel = 'general', limit = 50) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    user:users(name, avatar_url)
                `)
                .eq('channel', channel)
                .order('created_at', { ascending: true })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('메시지 가져오기 실패:', error);
            return [];
        }
    },
    
    // 메시지 전송
    async sendMessage(content, channel = 'general', messageType = 'normal', codeLanguage = null) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('로그인이 필요합니다.');
            
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    content,
                    channel,
                    message_type: messageType,
                    code_language: codeLanguage,
                    user_id: user.id
                })
                .select(`
                    *,
                    user:users(name, avatar_url)
                `);
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            throw error;
        }
    },
    
    // 실시간 메시지 구독
    subscribeToMessages(channel, callback) {
        return supabase
            .channel(`messages:${channel}`)
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `channel=eq.${channel}`
                }, 
                callback
            )
            .subscribe();
    }
};

// 글로벌 객체로 내보내기
window.SupabaseUtils = SupabaseUtils;
window.supabase = supabase;

console.log('Supabase 설정이 완료되었습니다.');