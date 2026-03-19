# 나만의 시간표 배경 생성기

React + Vite 기반의 현대적인 시간표 배경 생성 웹 애플리케이션입니다.

**버전:** v1.0.12

## ✨ 주요 기능

- 📸 배경 이미지 업로드
- 🖼️ 다양한 해상도 지원 (FHD, QHD, UHD, 커스텀)
- 🎨 텍스트 색상 선택 (흰색, 검은색)
- 📍 시간표 위치 조정 (가로/세로)
- 📏 크기 조절 (가로/세로 비율)
- 📚 시간표 데이터 입력 (요일, 강의명, 시간, 강의실)
- 🎭 뉴모피즘 디자인 UI
- 🖱️ 실시간 Canvas 렌더링
- ⬇️ PNG 이미지로 다운로드
- 🌐 반응형 디자인 (PC, 태블릿, 모바일)

## 📁 폴더 구조

```
webWallpaperTimetable/
├── index.html              # 메인 HTML
├── package.json            # 프로젝트 설정
├── vite.config.js          # Vite 설정
├── src/
│   ├── main.jsx            # 앱 진입점
│   ├── App.jsx             # 메인 컴포넌트
│   ├── App.css             # 전역 스타일
│   ├── components/
│   │   ├── Preview.jsx     # 결과 미리보기
│   │   ├── ScheduleInput.jsx # 시간표 입력
│   │   └── Settings.jsx    # 설정 패널
│   └── lib/
│       ├── canvas-renderer.js # Canvas 렌더링 로직
│       ├── palette-worker.js  # 색상 추출 워커
│       └── utils.js        # 유틸리티 함수
├── public/
│   ├── favicon.png         # 파비콘
│   ├── fonts/              # 로컬 폰트
│   └── ogimage.png         # OG 이미지
└── README.md               # 이 파일
```

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 미리보기

```bash
npm run preview
```

## 💻 사용법

1. 웹 애플리케이션 접속
2. 배경이 될 이미지 선택
3. 원하는 설정 조정
   - 해상도 선택
   - 텍스트 색상 설정
   - 시간표 위치 및 크기 조절
4. 수업 정보 입력
   - 요일, 강의명, 시간, 강의실 입력
   - 추가 버튼으로 여러 강의 등록
5. "배경화면 생성하기" 클릭
6. 생성된 이미지 다운로드 또는 새 탭에서 열기

## 🛠️ 기술 스택

- **프론트엔드:** React 19
- **빌드 도구:** Vite 8
- **스타일링:** CSS3 (Flexbox, Grid)
- **렌더링:** Canvas API
- **폰트:** Pretendard, Do Hyeon, Cafe24 Surround

## 🎨 디자인 특징

- **뉴모피즘 디자인:** 모든 버튼과 카드에 모던한 그라디언트 및 그림자 효과
- **부드러운 애니메이션:** 0.2s ease transition으로 자연스러운 상호작용
- **반응형 레이아웃:** 모바일, 태블릿, 데스크톱 최적화

## 📱 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)
- 모바일 브라우저 (iOS Safari, Chrome Android)

## 📝 라이선스

MIT License
