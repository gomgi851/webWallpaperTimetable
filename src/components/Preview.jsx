import React, { useEffect, useState } from 'react';
import { TimetableRenderer } from '../lib/canvas-renderer';
import { RESOLUTIONS } from '../lib/utils';

export default function Preview({
  bgImage,
  isBgProcessing,
  classes,
  textColor,
  hPos,
  vPos,
  resolution,
  horizontalSizePercent,
  verticalSizePercent,
  customWidth,
  customHeight,
  courseNameFontSize,
  courseRoomFontSize,
  labelFontSize,
  paletteColors,
  onShowToast
}) {
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const isBusy = isGenerating || isBgProcessing || !bgImage;

  useEffect(() => {
    return () => {
      if (downloadUrl && downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleGenerate = async () => {
    if (!bgImage) {
      onShowToast('배경화면 이미지를 먼저 선택해주세요.', 'warning');
      return;
    }

    setIsGenerating(true);

    try {
      try {
        await document.fonts.load("16px 'Cafe24 Surround'");
        const fontReadyPromise = document.fonts.ready;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Font loading timeout')), 5000)
        );
        await Promise.race([fontReadyPromise, timeoutPromise]);
      } catch (e) {
        console.warn('[font] loading warning:', e.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      let width;
      let height;
      if (resolution === 'custom') {
        width = customWidth;
        height = customHeight;
      } else if (resolution === 'original') {
        // 원본 화질: 배경 이미지의 실제 크기 사용
        width = bgImage.width;
        height = bgImage.height;
      } else {
        const res = RESOLUTIONS[resolution];
        width = res.width;
        height = res.height;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const renderer = new TimetableRenderer(
        canvas,
        bgImage,
        classes,
        textColor,
        hPos,
        vPos,
        horizontalSizePercent / 100,
        verticalSizePercent / 100,
        courseNameFontSize,
        courseRoomFontSize,
        labelFontSize,
        paletteColors
      );

      renderer.render();

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        onShowToast('이미지 생성에 실패했습니다. 다시 시도해주세요.', 'error');
        return;
      }

      if (downloadUrl && downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(downloadUrl);
      }
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setShowResult(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="generate-wrapper">
        <button
          className={`generate-btn ${isBusy ? 'is-busy' : ''}`}
          onClick={handleGenerate}
          disabled={isBusy}
          aria-busy={isGenerating || isBgProcessing}
        >
          {isBgProcessing ? 'loading...' : (isGenerating ? '생성 중...' : '배경화면 생성하기')}
        </button>
      </div>

      {showResult && (
        <div id="result-container" style={{ textAlign: 'center', marginTop: '30px' }}>
          <img
            src={downloadUrl}
            alt="Generated timetable wallpaper"
            id="preview-canvas"
            style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
          />
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <a href={downloadUrl} download="timetable.png" className="result-action-btn result-save-btn">
              이미지 저장하기
            </a>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="result-action-btn result-open-btn">
              새 탭에서 열기
            </a>
          </div>
        </div>
      )}
    </>
  );
}
