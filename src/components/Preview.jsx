import React, { useRef, useState } from 'react';
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

  const handleGenerate = async () => {
    if (!bgImage) {
      alert('배경화면 이미지를 선택해주세요.');
      return;
    }

    if (!paletteColors || paletteColors.length === 0) {
      alert('팔레트 추출 중입니다. 잠시만 기다려주세요.');
      return;
    }

    setIsGenerating(true);

    // 웹 폰트 완전 로드 대기
    console.log('[글씨체] 폰트 로딩 대기 중...');
    try {
      // Cafe24 Surround 폰트 명시적 로드
      await document.fonts.load("16px 'Cafe24 Surround'");
      console.log('[글씨체] Cafe24 Surround 폰트 로드 완료');
      
      // 모든 폰트 로딩 완료 대기 (최대 5초)
      const fontReadyPromise = document.fonts.ready;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Font loading timeout')), 5000)
      );
      
      await Promise.race([fontReadyPromise, timeoutPromise]);
    } catch (e) {
      console.warn('[글씨체] 폰트 로딩 중 경고:', e.message);
    }

    // 추가 대기 (폰트 후 처리 안정화)
    await new Promise(resolve => setTimeout(resolve, 200));

    // 캔버스 크기 설정
    let width, height;
    if (resolution === 'custom') {
      width = customWidth;
      height = customHeight;
    } else {
      const res = RESOLUTIONS[resolution];
      width = res.width;
      height = res.height;
    }

    // 시간표 크기 계산
    const timetableWidth = width * (horizontalSizePercent / 100);
    const timetableHeight = height * (verticalSizePercent / 100);

    // 임시 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // 렌더링
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

    // 다운로드 URL 저장
    const url = canvas.toDataURL('image/png');
    setDownloadUrl(url);

    // 결과 표시
    setShowResult(true);
    
    // ref 업데이트를 위해 다음 틱에 실행
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        ctx.drawImage(canvas, 0, 0);
      }
    }, 0);

    setIsGenerating(false);
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
