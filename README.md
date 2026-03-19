# 나만의 시간표 배경 생성기 (웹 버전)

백엔드 없이 순수 프론트엔드로 구현한 시간표 배경 생성기입니다.

## 기능

- 배경 이미지 업로드
- 다양한 해상도 지원 (FHD, QHD, 커스텀)
- 텍스트 색상 선택 (흰색, 검은색)
- 시간표 위치 조정 (가로/세로)
- 크기 조절
- 시간표 데이터 입력
- Canvas를 사용한 실시간 렌더링
- PNG 이미지로 다운로드

## 파일 구조

```
webWallpaperTimetable/
├── index.html              # 메인 HTML
├── css/
│   └── style.css          # 스타일시트
├── js/
│   ├── main.js            # 메인 로직
│   ├── canvas-renderer.js # Canvas 렌더링
│   └── utils.js           # 유틸리티 함수
└── README.md              # 이 파일
```

## 사용법

1. `index.html` 파일을 웹브라우저에서 열기
2. 배경 이미지 선택
3. 원하는 설정 (화질, 색상, 위치, 크기) 조절
4. 시간표 정보 입력
5. "배경화면 생성하기" 버튼 클릭
6. 생성된 이미지 다운로드

## 기술 스택

- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (ES6+)
- Canvas API
- Google Fonts (Black Han Sans, Pretendard)

## 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)

## 라이선스

MIT License
