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
        { id: '1', email: 'admin@devconnect.com', user_metadata: { name: '관리자' } },
        { id: '2', email: 'kim.dev@example.com', user_metadata: { name: '김개발' } },
        { id: '3', email: 'park.junior@example.com', user_metadata: { name: '박초보' } }
    ];
    
    const mockMessages = {
        general: [
            {
                id: '1',
                content: '안녕하세요! DevConnect에 오신 것을 환영합니다! 🎉',
                user_id: '1',
                channel: 'general',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                user: { name: '관리자', avatar_url: null }
            },
            {
                id: '2',
                content: '여기서 자유롭게 개발 관련 이야기를 나누세요!',
                user_id: '1',
                channel: 'general',
                created_at: new Date(Date.now() - 3000000).toISOString(),
                user: { name: '관리자', avatar_url: null }
            }
        ],
        javascript: [
            {
                id: '3',
                content: '```javascript\nconsole.log("Hello, World!");\nconst greeting = "안녕하세요!";\nconsole.log(greeting);\n```\n첫 번째 JavaScript 코드 공유입니다!',
                user_id: '2',
                channel: 'javascript',
                created_at: new Date(Date.now() - 1800000).toISOString(),
                user: { name: '김개발', avatar_url: null }
            },
            {
                id: '4',
                content: 'ES6의 화살표 함수에 대해 질문이 있어요. 언제 사용하는 게 좋을까요?',
                user_id: '3',
                channel: 'javascript',
                created_at: new Date(Date.now() - 900000).toISOString(),
                user: { name: '박초보', avatar_url: null }
            }
        ],
        python: [
            {
                id: '5',
                content: '```python\ndef hello_world():\n    print("안녕하세요, Python!")\n    return "DevConnect"\n\nresult = hello_world()\nprint(f"결과: {result}")\n```\nPython 기초 예제입니다!',
                user_id: '2',
                channel: 'python',
                created_at: new Date(Date.now() - 2400000).toISOString(),
                user: { name: '김개발', avatar_url: null }
            }
        ],
        react: [
            {
                id: '6',
                content: 'React Hooks에 대해 질문이 있어요. useEffect 사용법을 알려주세요!',
                user_id: '3',
                channel: 'react',
                created_at: new Date(Date.now() - 1200000).toISOString(),
                user: { name: '박초보', avatar_url: null }
            },
            {
                id: '7',
                content: '```jsx\nimport React, { useState, useEffect } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `카운트: ${count}`;\n  }, [count]);\n\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      클릭 횟수: {count}\n    </button>\n  );\n}\n```\nuseEffect 사용 예제입니다!',
                user_id: '2',
                channel: 'react',
                created_at: new Date(Date.now() - 600000).toISOString(),
                user: { name: '김개발', avatar_url: null }
            }
        ],
        nodejs: [],
        ai: [
            {
                id: '8',
                content: 'ChatGPT API를 활용한 프로젝트를 진행 중인데, rate limit 처리는 어떻게 하시나요?',
                user_id: '3',
                channel: 'ai',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                user: { name: '박초보', avatar_url: null }
            }
        ]
    };
    
    let currentUser = null;
    const authListeners = [];
    const messageListeners = [];
    
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
            select: function(columns = '*') {
                const query = this;
                return {
                    eq: function(column, value) {
                        query._filters = query._filters || {};
                        query._filters[column] = value;
                        return this;
                    },
                    order: function(column, options = {}) {
                        query._order = { column, ...options };
                        return this;
                    },
                    limit: function(count) {
                        query._limit = count;
                        return this;
                    },
                    then: function(resolve, reject) {
                        console.log(`Mock select from ${table}:`, query._filters);
                        
                        if (table === 'messages') {
                            let channelMessages = [];
                            
                            if (query._filters && query._filters.channel) {
                                const channel = query._filters.channel;
                                channelMessages = mockMessages[channel] || [];
                            } else {
                                // 모든 채널의 메시지 반환
                                channelMessages = Object.values(mockMessages).flat();
                            }
                            
                            if (query._order) {
                                channelMessages.sort((a, b) => {
                                    const aTime = new Date(a.created_at);
                                    const bTime = new Date(b.created_at);
                                    return query._order.ascending ? aTime - bTime : bTime - aTime;
                                });
                            }
                            
                            if (query._limit) {
                                channelMessages = channelMessages.slice(0, query._limit);
                            }
                            
                            return resolve({ data: channelMessages, error: null });
                        }
                        
                        return resolve({ data: [], error: null });
                    }
                };
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
                    
                    const channel = data.channel || 'general';
                    if (!mockMessages[channel]) {
                        mockMessages[channel] = [];
                    }
                    mockMessages[channel].push(newMessage);
                    
                    // 실시간 리스너들에게 알림
                    setTimeout(() => {
                        messageListeners.forEach(listener => {
                            if (listener.channel === channel) {
                                listener.callback({
                                    eventType: 'INSERT',
                                    new: newMessage
                                });
                            }
                        });
                    }, 100);
                    
                    return { data: [newMessage], error: null };
                }
                return { data: [data], error: null };
            }
        }),
        
        channel: (name) => {
            const channelObj = {
                _listeners: [],
                on: function(event, filter, callback) {
                    console.log(`Mock channel subscription: ${name}, ${event}`, filter);
                    
                    if (event === 'postgres_changes' && filter.table === 'messages') {
                        const channelName = filter.filter ? filter.filter.split('=eq.')[1] : 'general';
                        const listener = {
                            channel: channelName,
                            callback: callback
                        };
                        this._listeners.push(listener);
                        messageListeners.push(listener);
                    }
                    
                    return this;
                },
                subscribe: function() {
                    console.log(`Mock channel subscribed: ${name}`);
                    return { 
                        unsubscribe: () => {
                            console.log(`Mock channel unsubscribed: ${name}`);
                            // 리스너 제거
                            this._listeners.forEach(listener => {
                                const index = messageListeners.indexOf(listener);
                                if (index > -1) {
                                    messageListeners.splice(index, 1);
                                }
                            });
                            this._listeners = [];
                        }
                    };
                }
            };
            return channelObj;
        }
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
                .select('*')
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
                });
            
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