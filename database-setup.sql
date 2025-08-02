-- DevConnect 데이터베이스 설정 스크립트
-- Supabase SQL 편집기에서 실행하세요

-- 사용자 프로필 테이블 (auth.users 확장)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    github_username TEXT,
    bio TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채널 테이블
CREATE TABLE IF NOT EXISTS public.channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'fas fa-hashtag',
    color TEXT DEFAULT 'text-primary',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_default BOOLEAN DEFAULT FALSE
);

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    channel TEXT REFERENCES public.channels(id),
    message_type TEXT DEFAULT 'text', -- 'text', 'code', 'meeting', 'question', 'store'
    code_language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 멘토링 질문 테이블
CREATE TABLE IF NOT EXISTS public.mentoring_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tech_stack TEXT,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'open', -- 'open', 'answered', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코드 스토어 테이블
CREATE TABLE IF NOT EXISTS public.code_store (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    repo_url TEXT NOT NULL,
    price INTEGER NOT NULL,
    seller_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' -- 'active', 'sold', 'inactive'
);

-- 화상회의 테이블
CREATE TABLE IF NOT EXISTS public.video_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    meeting_url TEXT NOT NULL,
    meeting_id TEXT,
    password TEXT,
    host_id UUID REFERENCES auth.users(id),
    channel TEXT REFERENCES public.channels(id),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    meeting_type TEXT DEFAULT 'instant', -- 'instant', 'scheduled'
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 채널 삽입
INSERT INTO public.channels (id, name, description, icon, color, is_default) 
VALUES ('general', '일반', '일반적인 대화를 나누는 공간', 'fas fa-hashtag', 'text-gray-500', true)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) 설정
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_meetings ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 채널 정책
CREATE POLICY "Anyone can view channels" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create channels" ON public.channels FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Channel creators can update their channels" ON public.channels FOR UPDATE USING (auth.uid() = created_by);

-- 메시지 정책
CREATE POLICY "Anyone can view messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

-- 멘토링 질문 정책
CREATE POLICY "Anyone can view questions" ON public.mentoring_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can ask questions" ON public.mentoring_questions FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.mentoring_questions FOR UPDATE USING (auth.uid() = user_id);

-- 코드 스토어 정책
CREATE POLICY "Anyone can view store items" ON public.code_store FOR SELECT USING (true);
CREATE POLICY "Authenticated users can sell code" ON public.code_store FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);
CREATE POLICY "Sellers can update their items" ON public.code_store FOR UPDATE USING (auth.uid() = seller_id);

-- 화상회의 정책
CREATE POLICY "Anyone can view meetings" ON public.video_meetings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create meetings" ON public.video_meetings FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = host_id);
CREATE POLICY "Hosts can update their meetings" ON public.video_meetings FOR UPDATE USING (auth.uid() = host_id);

-- 실시간 구독을 위한 함수들
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 프로필 업데이트 시간 트리거
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();