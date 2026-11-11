# 제3자 소프트웨어·폰트·모델 고지

이 저장소의 자체 애플리케이션 코드에는 기존 `package.json`의 **ISC** 표기를 적용합니다([LICENSE](LICENSE)). 폰트·OCR·사전학습 및 추가 학습 모델·외부 라이브러리는 각 원저작자의 별도 라이선스를 따릅니다. 외부 구성요소의 라이선스를 ISC로 변경하지 않습니다.

라이선스 사본은 `public/licenses/`에 저장하며 Vite 빌드의 `dist/licenses/`에도 포함됩니다. 배포 사이트에서는 `/licenses/index.html`로 열 수 있습니다. 원문 고지 파일은 삭제하거나 자체 프로젝트 라이선스로 대체하지 마세요.

## 폰트

| 구성요소 | 사용 위치 | 라이선스 원문 | 공식 출처 |
|---|---|---|---|
| Cafe24 Ssurround | 기본 배경 이미지 글꼴, 로컬 WOFF | [OFL 1.1](public/licenses/fonts/Cafe24-Ssurround-OFL-1.1.txt), [공식 배포본 동봉 안내 PDF](public/licenses/fonts/Cafe24-Ssurround-License.pdf) | [Cafe24](https://fonts.cafe24.com/), [공식 v2.0 배포본](https://img.cafe24.com/csdstatic/freefonts/download/kr/Cafe24Ssurround-v2.0.zip) |
| Do Hyeon | 제목·버튼 CSS | [OFL 1.1](public/licenses/fonts/DoHyeon-OFL-1.1.txt) | [Google Fonts 원본](https://github.com/google/fonts/tree/main/ofl/dohyeon) |
| Pretendard | UI 글꼴 설정 | [OFL 1.1 및 원저작권·Reserved Font Names](public/licenses/fonts/Pretendard-OFL-1.1.txt) | [orioncactus/pretendard](https://github.com/orioncactus/pretendard) |
| Black Han Sans | index.html의 외부 스타일시트 참조 | [OFL 1.1](public/licenses/fonts/BlackHanSans-OFL-1.1.txt) | [Google Fonts 원본](https://github.com/google/fonts/tree/main/ofl/blackhansans) |

OFL의 허용·조건은 첨부한 원문을 따릅니다. 폰트 파일 자체를 판매하지 않고, 폰트를 재배포할 때 원저작권 고지와 라이선스를 함께 유지합니다. 이 프로젝트는 저장소에 있던 Cafe24 WOFF 글리프를 수정하지 않았습니다. 파일 내부 family/version/copyright는 Cafe24 Ssurround Bold / Version 1.001 / Cafe24 Corp.로 확인했습니다. 기존 WOFF는 현재 공식 ZIP의 WOFF와 바이트가 동일하지 않으므로 공식 파일의 무수정 복제본이라고 단정하지 않습니다.

사용자가 직접 업로드하는 폰트·사진은 저장소나 배포 자산에 포함하지 않습니다. 해당 파일의 이용 조건은 업로드한 파일의 라이선스를 따릅니다.

## OCR·AI 모델

| 구성요소 | 역할 | 라이선스·고지 |
|---|---|---|
| [Tesseract.js](https://github.com/naptha/tesseract.js) 6.0.1 | 브라우저 OCR 워커 | [Apache-2.0](public/licenses/timetable-ocr/Tesseract.js-APACHE-2.0.txt) |
| [Tesseract.js-core](https://github.com/naptha/tesseract.js-core) 6.1.2 | WASM OCR 코어 | [Apache-2.0](public/licenses/timetable-ocr/Tesseract.js-core-APACHE-2.0.txt) |
| [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) | 코어 원본 | [Apache-2.0](public/licenses/timetable-ocr/Tesseract-APACHE-2.0.txt) |
| [Leptonica](https://github.com/DanBloomberg/leptonica) | OCR 이미지 처리 라이브러리 | [BSD-2-Clause](public/licenses/timetable-ocr/Leptonica-BSD-2-Clause.txt) |
| [tessdata_best](https://github.com/tesseract-ocr/tessdata_best) 한국어·영어 | 과목명·강의실 OCR 사전학습 가중치 | [Apache-2.0](public/licenses/timetable-ocr/tessdata_best-APACHE-2.0.txt) |
| [JaidedAI/EasyOCR](https://github.com/JaidedAI/EasyOCR) english_g2 기반 room-code-v2 | 강의실 코드 추가 학습 모델 | [Apache-2.0](public/licenses/timetable-ocr/EasyOCR-APACHE-2.0.txt), [모델 출처·변경 내역](public/licenses/timetable-ocr/MODEL_CARD.md) |
| [ONNX Runtime Web](https://github.com/microsoft/onnxruntime/tree/v1.22.0) 1.22.0 | 브라우저 내 모델 실행 | [MIT](public/licenses/timetable-ocr/ONNX-Runtime-LICENSE.txt), [원본 ThirdPartyNotices](public/licenses/timetable-ocr/ONNX-Runtime-ThirdPartyNotices.txt) |

[통합 NOTICE](public/licenses/timetable-ocr/NOTICE.txt)에 원본과 파생 모델의 관계, 추가 학습·내보내기 및 통합 변경을 표시합니다. 모델 바이너리를 Git에서 제외했더라도 사이트에서 내려주는 가중치에는 해당 원본의 라이선스 고지를 함께 제공합니다. 공개 모델 사용을 이유로 사용자 이미지·정답 데이터를 공개하지 않습니다.

## npm 의존성

[의존성 목록](public/licenses/npm-dependencies.json)과 [저작권·라이선스 모음](public/licenses/npm-dependencies-NOTICES.txt)은 설치된 `package-lock.json` 기준으로 생성합니다. React/React DOM, OCR·ONNX 런타임의 JS 의존성과 설치된 빌드 도구를 포함합니다. 현재 플랫폼에 설치되지 않은 선택적 네이티브 패키지는 포함하지 않습니다. ONNX Runtime과 Rolldown의 별도 제3자 고지도 유지합니다.

`guid-typescript@1.0.9`는 npm 메타데이터에서 ISC를 선언하지만 npm 배포본과 확인한 원본 저장소에 독립 LICENSE 파일이 없습니다. 이 항목은 원본 package.json 선언과 SPDX ISC 표준 참고문을 구별해 수록했습니다. 존재하지 않는 원저작권 문구를 만들어 넣지 않았습니다. 이 목록은 법률상 모든 가능한 의무를 완결적으로 보증하는 문서가 아닙니다.

재생성: `npm run licenses:generate`. `npm run build`에서도 자동 실행합니다. 외부 라이선스 원문을 다시 내려받아 갱신할 때는 `public/licenses/sources.json`의 출처와 체크섬도 함께 확인하세요.
