# mzc-lp-frontend

> MZC Learn Platform - Frontend Web App

---

https://mzc-lp-frontend.vercel.app/tu/b2c


## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Language | TypeScript | 5.6.x |
| Framework | React | 19.x |
| Build | Vite | 6.x |
| Styling | TailwindCSS + CVA | 3.4.x |
| State | Zustand (클라이언트) + React Query (서버) | 5.x |
| UI | Radix UI + lucide-react | - |
| Routing | react-router-dom | 7.x |
| Test | Vitest | 4.x |

---

## 실행 방법

### 1. 환경 설정

```bash
cp .env.example .env
```

`.env` 파일 설정:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STATIC_BASE_URL=http://localhost:8080
VITE_APP_ENV=development
VITE_APP_NAME=MZC Learn
VITE_ENABLE_MOCK=false
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 접속 확인

- http://localhost:3000

### 5. UI 컴포넌트 미리보기

- http://localhost:3000/showcase
- Radix UI 기반 공통 컴포넌트 전체 목록 확인 가능

---

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 실행 |
| `npm run test` | 테스트 실행 |
| `npm run test:watch` | 테스트 워치 모드 |
| `npm run test:ui` | Vitest UI 실행 |

---

## 프로젝트 구조

```
src/
├── assets/                  # 정적 파일 (fonts, icons, images)
├── components/
│   ├── common/              # 공통 컴포넌트 (66개)
│   ├── domain/              # 도메인별 컴포넌트
│   │   ├── admin/
│   │   ├── co/
│   │   ├── community/
│   │   ├── course-community/
│   │   ├── course-review/
│   │   ├── ta/
│   │   └── tu/
│   ├── layout/              # 레이아웃 (AdminLayout, Sidebar)
│   └── landing/             # 랜딩 페이지 컴포넌트
├── config/                  # 설정 파일
├── contexts/                # React Context
├── hooks/                   # React Query 훅
│   ├── common/
│   ├── sa/
│   ├── ta/
│   ├── tu/
│   └── co/
├── pages/
│   ├── sa/                  # System Admin 페이지
│   ├── ta/                  # Tenant Admin 페이지
│   ├── tu/                  # Tenant User 페이지
│   ├── co/                  # Course Operator 페이지
│   ├── auth/                # 인증 페이지
│   └── common/              # 공통 페이지
├── routes/                  # 라우팅 설정
├── services/                # API 호출
│   ├── common/
│   ├── sa/
│   ├── ta/
│   ├── tu/
│   └── co/
├── store/                   # Zustand 스토어
├── styles/                  # 디자인 토큰
├── test/                    # 테스트 유틸리티
├── types/                   # TypeScript 타입
│   ├── admin/
│   ├── common/
│   ├── sa/
│   ├── ta/
│   ├── tu/
│   └── co/
└── utils/                   # 유틸리티
```

---

## 사용자 역할

| 역할 | 코드 | 설명 |
|------|------|------|
| System Admin | `SYSTEM_ADMIN` | 플랫폼 전체 관리자 |
| Tenant Admin | `TENANT_ADMIN` | 테넌트 최고 관리자 |
| Operator | `OPERATOR` | 과정 운영자 |
| Designer | `DESIGNER` | 과정 설계자 (강의계획 생성) |
| Instructor | `INSTRUCTOR` | 강사 (교수 활동) |
| User | `USER` | 일반 사용자 (학습자) |

---

## 역할 기반 라우팅

| 경로 | 접근 역할 | 설명 |
|------|----------|------|
| `/sa/*` | SYSTEM_ADMIN | 플랫폼 전체 관리 |
| `/ta/*` | TENANT_ADMIN | 테넌트 관리 |
| `/tu/*` | USER, DESIGNER, INSTRUCTOR, OPERATOR, TENANT_ADMIN | 사용자 기능 |
| `/co/*` | OPERATOR | 과정 운영 |

### TU 세부 라우트

| 경로 | 주요 사용 역할 | 설명 |
|------|---------------|------|
| `/tu/learning/*` | USER | 학습 (수강, 진도, 과제) |
| `/tu/teaching/*` | DESIGNER, INSTRUCTOR | 강의 관리 (과정 생성, 콘텐츠, 교수 활동) |
| `/tu/mypage/*` | 전체 | 마이페이지 (프로필, 수강내역) |
| `/tu/catalog/*` | 전체 | 과정 카탈로그 |
| `/tu/b2b/*` | 전체 | B2B 전용 기능 |

### 페이지 상세

**SA (System Admin)**
- dashboard, analytics, tenants, billing, notices, settings, system

**TA (Tenant Admin)**
- dashboard, analytics, users, branding, automation, features, notices, settings, system

**TU (Tenant User)**
- dashboard, main, catalog, learning, mypage, settings, teaching, b2b

**CO (Course Operator)**
- dashboard, course, enrollment, auto-enrollment, member-pool, instructor, time, user, notices

---

## 라우트 파일

| 파일 | 설명 |
|------|------|
| `auth.routes.tsx` | 인증 (로그인, 회원가입) |
| `sa.routes.tsx` | System Admin 라우트 |
| `ta.routes.tsx` | Tenant Admin 라우트 |
| `tu.routes.tsx` | Tenant User 메인 라우트 |
| `tu.b2b.routes.tsx` | B2B 사용자 라우트 |
| `tu.b2c.routes.tsx` | B2C 사용자 라우트 |
| `tu.mypage.routes.tsx` | 마이페이지 라우트 |
| `tu.teaching.routes.tsx` | 강의 관련 라우트 |
| `co.routes.tsx` | Course Operator 라우트 |

---

## 관련 문서

| 문서 | 위치 |
|------|------|
| 전체 문서 | [mzc-lp-docs](https://github.com/mzcATU/mzc-lp-docs) |
| 컨벤션 | [docs/conventions/](https://github.com/mzcATU/mzc-lp-docs/tree/main/docs/conventions) |
| 디자인 시스템 | [docs/conventions/design/](https://github.com/mzcATU/mzc-lp-docs/tree/main/docs/conventions/design) |
