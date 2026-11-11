# room-code-v2: provenance and modification notice

- Upstream architecture and pretrained weights: JaidedAI/EasyOCR, VGG + BiLSTM + CTC (`english_g2`). Upstream license: Apache License 2.0, included alongside this file. Upstream project: https://github.com/JaidedAI/EasyOCR .
- Pretrained checkpoint: https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/english_g2.zip . Original checkpoint SHA-256: e2272681d9d67a04e2dff396b6e95077bc19001f8f6d3593c307b9852e1c29e8 .
- Modified work: gomgi851/timetable-recognizer, commit 33477cd. Training implementation: https://github.com/gomgi851/timetable-recognizer/tree/33477cd/training .
- Changes: froze CNN and first BiLSTM; fine-tuned the last BiLSTM and output layer for classroom alphanumeric codes using user-supplied screenshot crops; selected epoch 15 by validation; exported fixed-shape FP32 ONNX. Fine-tuning used 32 deduplicated training crops with augmentation; private images and labels are not distributed here.
- Exported artifact: room-code-v2.onnx, 3,781,345 parameters, 15,143,302 bytes. SHA-256: 8398d455255f3cb728e819152118594e956eaed092cc21cc77ad4770fb375b53 .
- Model input: grayscale 1x1x64x320, normalized to [-1,1], white padding. Greedy CTC decoding restricted to ASCII alphanumeric/hyphen, uppercase output. No room dictionary.
- Browser integration changes: asset URL namespace /timetable-ocr/, worker progress reporting, automatic application of structurally valid detected classes, and course-title spacing. Browser Canvas resize is not pixel-identical to Python/Pillow bicubic.
- Purpose: classroom codes only. Korean subject names use separate Tesseract models. This is not a general timetable vision model and does not guarantee OCR spelling accuracy. The four-course automatic-import threshold validates fields/times, not ground-truth accuracy.
- This license notice does not claim that training data or user uploads are Apache-licensed. Those images are excluded from the repository and deployment.

The upstream license continues to apply to the upstream work and this modified model; retain the included Apache-2.0 license and notices when redistributing.
