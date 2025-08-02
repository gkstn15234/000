# DevConnect 🚀

**개발자들을 위한 통합 커뮤니티 플랫폼**

실시간 토론 • 코드 공유 • 화상 회의 • 멘토링

![DevConnect Preview](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=DevConnect)

## 📋 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [배포 가이드](#배포-가이드)
- [프로젝트 구조](#프로젝트-구조)
- [기여하기](#기여하기)
- [라이센스](#라이센스)

## 📖 소개

DevConnect는 전 세계 개발자들이 실시간으로 소통하고, 코드를 공유하며, 함께 성장할 수 있는 통합 커뮤니티 플랫폼입니다.

### ✨ 왜 DevConnect인가요?

- **🔥 실시간 소통**: Discord 스타일의 즉석 채팅과 토론
- **💻 코드 중심**: 문법 강조와 함께하는 코드 공유
- **🎥 화상 회의**: Zoom 통합으로 원클릭 미팅
- **🎯 멘토링**: 경험 있는 개발자와 신입 개발자 매칭
- **🌍 글로벌**: 전 세계 개발자들과의 네트워킹

## 🎯 주요 기능

### 👥 실시간 커뮤니티
- **기술별 채널**: JavaScript, Python, React, AI/ML 등
- **실시간 채팅**: 즉석 질문과 답변
- **이모지 반응**: 메시지에 대한 빠른 피드백

### 💻 코드 공유
- **문법 강조**: Prism.js 기반 코드 하이라이팅
- **다양한 언어 지원**: 20+ 프로그래밍 언어
- **원클릭 복사**: 코드 블록 복사 기능

### 🎥 화상 회의
- **Zoom 통합**: 원클릭 미팅 생성
- **스크린 공유**: 코드 리뷰와 페어 프로그래밍
- **정기 스터디**: 주제별 정기 모임

### 🎓 멘토링 시스템
- **스킬 기반 매칭**: 멘토와 멘티 자동 매칭
- **실무 경험 공유**: 현직 개발자의 조언
- **커리어 가이드**: 취업과 이직 정보

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Tailwind CSS 기반 스타일링
- **JavaScript (ES6+)**: 바닐라 자바스크립트
- **Font Awesome**: 아이콘
- **Prism.js**: 코드 문법 강조

### Backend & Database
- **Supabase**: PostgreSQL 데이터베이스
- **실시간 기능**: Supabase 실시간 구독
- **인증**: Supabase Auth (이메일, OAuth)
- **스토리지**: Supabase Storage

### 배포 & 인프라
- **Cloudflare Pages**: 정적 사이트 호스팅
- **GitHub**: 버전 관리 및 CI/CD
- **CDN**: 글로벌 콘텐츠 전송

### 외부 연동
- **GitHub API**: 프로필 연동
- **Zoom API**: 화상 회의
- **Web Notifications**: 브라우저 알림

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/yourusername/devconnect.git
cd devconnect
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `js/supabase-config.js` 파일에서 설정 변경:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. 데이터베이스 테이블 생성

Supabase SQL 에디터에서 다음 스크립트 실행:

```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    github_username TEXT,
    bio TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메시지 테이블
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    channel TEXT DEFAULT 'general',
    message_type TEXT DEFAULT 'normal',
    code_language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채널 테이블
CREATE TABLE channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    github_url TEXT,
    demo_url TEXT,
    tech_stack TEXT[],
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
CREATE POLICY "Public users are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Messages are viewable by everyone." ON messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages." ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Channels are viewable by everyone." ON channels FOR SELECT USING (true);
CREATE POLICY "Projects are viewable by everyone." ON projects FOR SELECT USING (true);
CREATE POLICY "Users can insert their own projects." ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. 로컬 서버 실행

간단한 HTTP 서버 실행:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 패키지 필요)
npx http-server

# Live Server (VS Code 확장)
Live Server 확장 설치 후 index.html 우클릭 → "Open with Live Server"
```

### 5. 브라우저에서 접속

`http://localhost:8000` 또는 Live Server URL로 접속

## 🌐 배포 가이드

### Cloudflare Pages 배포

1. **GitHub 레포지토리 연결**
   - Cloudflare Dashboard → Pages → "Connect to Git"
   - GitHub 레포지토리 선택

2. **빌드 설정**
   - Framework preset: None
   - Build command: (비워둠)
   - Build output directory: `/`

3. **환경 변수 설정**
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase anon key

4. **도메인 설정**
   - 커스텀 도메인 연결 (선택사항)
   - SSL 인증서 자동 생성

### Supabase 프로덕션 설정

1. **인증 설정**
   - Site URL: `https://your-domain.pages.dev`
   - Redirect URLs: 도메인 추가

2. **실시간 기능 활성화**
   - Database → Replication → 테이블별 실시간 활성화

3. **보안 설정**
   - RLS 정책 확인
   - API 키 보안 관리

## 📁 프로젝트 구조

```
devconnect/
├── index.html              # 메인 HTML 파일
├── css/
│   └── style.css           # 커스텀 CSS 스타일
├── js/
│   ├── supabase-config.js  # Supabase 설정 및 유틸리티
│   ├── auth.js             # 인증 관리
│   ├── chat.js             # 실시간 채팅
│   └── main.js             # 메인 애플리케이션 로직
├── assets/                 # 이미지, 아이콘 등
├── README.md               # 프로젝트 문서
└── package.json            # 의존성 정보 (선택사항)
```

## 🔧 개발 가이드

### 새로운 채널 추가

1. 데이터베이스에 채널 추가:
```sql
INSERT INTO channels (name, description) VALUES ('new-channel', '새 채널 설명');
```

2. HTML에 채널 버튼 추가:
```html
<button class="channel-btn" data-channel="new-channel">
    <i class="fas fa-icon mr-2"></i>New Channel
</button>
```

### 새로운 기능 추가

1. HTML 구조 추가
2. CSS 스타일링
3. JavaScript 이벤트 핸들러 추가
4. Supabase 데이터베이스 스키마 업데이트 (필요시)

### 코드 스타일

- **들여쓰기**: 4칸 스페이스
- **네이밍**: camelCase (JavaScript), kebab-case (CSS)
- **주석**: 한국어로 작성
- **함수**: 목적이 명확한 작은 함수들로 분리

## 🤝 기여하기

DevConnect는 오픈소스 프로젝트입니다! 기여를 환영합니다.

### 기여 방법

1. **이슈 확인**: GitHub Issues에서 버그나 기능 요청 확인
2. **포크**: 프로젝트를 포크합니다
3. **브랜치 생성**: `git checkout -b feature/amazing-feature`
4. **커밋**: `git commit -m 'Add some amazing feature'`
5. **푸시**: `git push origin feature/amazing-feature`
6. **풀 리퀘스트**: GitHub에서 Pull Request 생성

### 기여 가이드라인

- 코드 스타일 준수
- 테스트 작성 (해당되는 경우)
- 문서 업데이트
- 커밋 메시지는 명확하게 작성

## 🐛 알려진 이슈

- [ ] 모바일 반응형 개선 필요
- [ ] 이미지 업로드 기능 추가 예정
- [ ] 다크 모드 지원 계획

## 🔮 로드맵

### 단기 (1-2개월)
- [ ] 프로필 페이지 완성
- [ ] 프로젝트 쇼케이스 기능
- [ ] 모바일 앱 (PWA) 최적화

### 중기 (3-6개월)
- [ ] 멘토링 매칭 시스템
- [ ] 화상회의 내장 (WebRTC)
- [ ] 코드 에디터 통합

### 장기 (6개월+)
- [ ] AI 기반 코드 리뷰
- [ ] 블록체인 기반 뱃지 시스템
- [ ] VR/AR 코딩 환경

## 📄 라이센스

이 프로젝트는 [MIT 라이센스](LICENSE) 하에 배포됩니다.

## 📞 연락처

- **프로젝트 메인테이너**: [your-email@example.com]
- **GitHub**: [https://github.com/yourusername/devconnect]
- **데모**: [https://devconnect.pages.dev]

## 🙏 감사의 말

- [Supabase](https://supabase.com) - 훌륭한 백엔드 서비스
- [Cloudflare](https://cloudflare.com) - 글로벌 CDN과 호스팅
- [Tailwind CSS](https://tailwindcss.com) - 유틸리티 CSS 프레임워크
- [Prism.js](https://prismjs.com) - 코드 문법 강조
- [Font Awesome](https://fontawesome.com) - 아이콘

---

**DevConnect로 전 세계 개발자들과 함께 성장하세요! 🚀**