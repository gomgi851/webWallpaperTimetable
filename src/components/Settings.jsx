import React, { useRef } from 'react';
import { RESOLUTIONS } from '../lib/utils';
import { DEFAULT_FONT_ID, DEFAULT_FONT_NAME } from '../lib/font-storage';

export default function Settings({
  bgFileName,
  onBgImageChange,
  resolution,
  onResolutionChange,
  textColor,
  onTextColorChange,
  hPos,
  onHPosChange,
  vPos,
  onVPosChange,
  horizontalSizePercent,
  onHorizontalSizePercentChange,
  verticalSizePercent,
  onVerticalSizePercentChange,
  customWidth,
  onCustomWidthChange,
  customHeight,
  onCustomHeightChange,
  courseNameFontSize,
  onCourseNameFontSizeChange,
  courseRoomFontSize,
  onCourseRoomFontSizeChange,
  labelFontSize,
  onLabelFontSizeChange,
  customFonts,
  selectedFontId,
  onFontSelect,
  onFontUpload,
  onFontDelete,
}) {
  const fontInputRef = useRef(null);

  const handleFontFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFontUpload(file);
    }
    e.target.value = '';
  };

  const isCustomFontSelected = selectedFontId !== DEFAULT_FONT_ID;

  return (
    <div className="card">
      <h3>1. 배경 및 설정</h3>

      {/* 1번 줄: 배경 선택 | 시간표 폰트 | 표 색상 — 한 줄 */}
      <div className="settings-row top-settings-row">
        <div className="setting-item color-setting-item">
          <label>표 색상</label>
          <div className="color-button-group">
            <button
              className={`color-button ${textColor === 'white' ? 'selected' : ''}`}
              data-color="white"
              style={{ backgroundColor: 'white', borderColor: '#333' }}
              onClick={() => onTextColorChange('white')}
              aria-label="흰색 글자"
            />
            <button
              className={`color-button ${textColor === 'black' ? 'selected' : ''}`}
              data-color="black"
              style={{ backgroundColor: 'rgb(30,30,30)', borderColor: '#ccc' }}
              onClick={() => onTextColorChange('black')}
              aria-label="검은색 글자"
            />
          </div>
        </div>

        <div className="setting-item">
          <label>배경 선택</label>
          <div className="upload-row">
            <label htmlFor="bg-file-input" className="bg-file-label">
              {bgFileName ? '변경하기' : '파일 선택'}
            </label>
            <input
              id="bg-file-input"
              type="file"
              accept="image/*"
              onChange={onBgImageChange}
            />
            {bgFileName && (
              <span className="file-applied">✓ 적용됨</span>
            )}
          </div>
        </div>

        <div className="setting-item font-row-item">
          <label>시간표 폰트</label>
          <div className="font-select-row">
            <label
              htmlFor="font-file-input"
              className="upload-font-btn"
              title=".ttf .otf .woff .woff2 · 5MB"
            >
              폰트 업로드
            </label>
            <input
              id="font-file-input"
              ref={fontInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFontFileChange}
            />
            <select
              value={selectedFontId}
              onChange={(e) => onFontSelect(e.target.value)}
              className="font-select"
            >
              <option value={DEFAULT_FONT_ID}>{DEFAULT_FONT_NAME}</option>
              {customFonts.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button
              className="font-delete-btn"
              onClick={() => onFontDelete(selectedFontId)}
              title="선택된 폰트 삭제"
              aria-label="선택된 폰트 삭제"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* 3번 줄: 화질 | 강의명 글씨 크기 | 강의실 글씨 크기 | 요일/시간 글씨 크기 */}
      <div className="settings-row">
        <div className="setting-item">
          <label>화질</label>
          <select value={resolution} onChange={(e) => onResolutionChange(e.target.value)}>
            <option value="fhd">FHD (1920x1080)</option>
            <option value="qhd">QHD (2560x1440)</option>
            <option value="uhd">UHD (3840x2160)</option>
            <option value="original">원본 화질</option>
            <option value="custom">직접 입력</option>
          </select>
        </div>
        <div className="setting-item">
          <label>요일/시간 글씨 크기(px)</label>
          <input
            type="number"
            min="8"
            max="40"
            value={labelFontSize}
            onChange={(e) => onLabelFontSizeChange(parseInt(e.target.value))}
          />
        </div>
        <div className="setting-item">
          <label>강의명 글씨 크기(px)</label>
          <input
            type="number"
            min="8"
            max="40"
            value={courseNameFontSize}
            onChange={(e) => onCourseNameFontSizeChange(parseInt(e.target.value))}
          />
        </div>
        <div className="setting-item">
          <label>강의실 글씨 크기(px)</label>
          <input
            type="number"
            min="8"
            max="40"
            value={courseRoomFontSize}
            onChange={(e) => onCourseRoomFontSizeChange(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* 4번 줄: 가로 위치 | 세로 위치 | 가로 크기 | 세로 크기 */}
      <div className="settings-row">
        <div className="setting-item">
          <label>가로 위치</label>
          <select value={hPos} onChange={(e) => onHPosChange(e.target.value)}>
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>
        </div>
        <div className="setting-item">
          <label>세로 위치</label>
          <select value={vPos} onChange={(e) => onVPosChange(e.target.value)}>
            <option value="top">상단</option>
            <option value="center">중앙</option>
            <option value="bottom">하단</option>
          </select>
        </div>
        <div className="setting-item">
          <label>가로 크기(%)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={horizontalSizePercent}
            onChange={(e) => onHorizontalSizePercentChange(parseInt(e.target.value))}
          />
        </div>
        <div className="setting-item">
          <label>세로 크기(%)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={verticalSizePercent}
            onChange={(e) => onVerticalSizePercentChange(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* custom 선택 시: 가로(px) | 세로(px) */}
      {resolution === 'custom' && (
        <div className="settings-row">
          <div className="setting-item">
            <label>가로(px)</label>
            <input
              type="number"
              min="100"
              value={customWidth}
              onChange={(e) => onCustomWidthChange(parseInt(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>세로(px)</label>
            <input
              type="number"
              min="100"
              value={customHeight}
              onChange={(e) => onCustomHeightChange(parseInt(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
