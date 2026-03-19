import React, { useEffect, useRef, useState } from 'react';
import { TimetableRenderer } from '../lib/canvas-renderer';
import { RESOLUTIONS } from '../lib/utils';

export default function Preview({
  bgImage,
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
  paletteColors
}) {
  const canvasRef = useRef(null);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!showResult || !downloadUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = previewSize.width;
      canvas.height = previewSize.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    img.src = downloadUrl;
  }, [showResult, downloadUrl, previewSize]);

  const handleGenerate = async () => {
    if (!bgImage) {
      alert('배경화면 이미지를 먼저 선택해주세요.');
      return;
    }

    if (!paletteColors || paletteColors.length === 0) {
      alert('색상 추출 중입니다. 잠시만 기다려주세요.');
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

      const url = canvas.toDataURL('image/png');
      setDownloadUrl(url);
      setPreviewSize({ width, height });
      setShowResult(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="generate-wrapper">
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? '생성 중...' : '배경화면 생성하기'}
        </button>
      </div>

      {showResult && (
        <div id="result-container" style={{ textAlign: 'center', marginTop: '30px' }}>
          <h3>배경화면이 완성되었어요</h3>
          <canvas
            ref={canvasRef}
            id="preview-canvas"
            style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
          />
          <div style={{ marginTop: '15px' }}>
            <a
              href={downloadUrl}
              download="timetable.png"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#2d3748',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              이미지 저장하기
            </a>
          </div>
        </div>
      )}
    </>
  );
}
