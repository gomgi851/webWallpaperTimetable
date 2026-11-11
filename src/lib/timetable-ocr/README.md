# Browser timetable recognition

Vendored from gomgi851/timetable-recognizer commit 33477cd. Geometry, OCR preprocessing and the trained room-code-v2 weights are unchanged. Asset URLs are namespaced under /timetable-ocr/ for this application.

- Tesseract.js 6.0.1 + tessdata_best kor/eng: subject names and room text.
- EasyOCR-derived VGG/BiLSTM/CTC room-code-v2, ONNX Runtime Web 1.22.0 WASM CPU: room codes only.
- No model training in this integration. Names can still contain OCR mistakes.
- Time-unspecified subjects outside the grid are excluded.
- Models/runtime are loaded only when the user starts recognition in a Web Worker.
- `npm run setup:ocr` installs binaries, validating all SHA-256 hashes in assets.json.
- Images and private evaluation fixtures must never be placed in public/ or committed.
- Upstream licenses and notices: public/licenses/timetable-ocr/ (Apache-2.0; ONNX Runtime MIT).

Detailed upstream attribution, model modifications and licenses: ../../../THIRD_PARTY_NOTICES.md and public/licenses/timetable-ocr/MODEL_CARD.md (repository root).
