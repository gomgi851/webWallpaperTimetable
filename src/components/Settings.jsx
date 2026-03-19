import React from 'react';
import { RESOLUTIONS } from '../lib/utils';

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
  onLabelFontSizeChange
}) {
  return (
    <div className="card">
      <h3>1. 배경 및 설정</h3>
      
      {/* 1번 줄: 배경 선택 | 표 색상 */}
      <div className="settings-row">
        <div className="setting-item" style={{ flex: '2' }}>
          <div className="upload-section">
            <label className="upload-label">배경 선택</label>
            <div className="upload-row">
              <label htmlFor="bg-file-input" className="bg-file-label">choose file</label>
              <input
                id="bg-file-input"
                type="file"
                accept="image/*"
                onChange={onBgImageChange}
              />
              <span className="file-name">{bgFileName}</span>
            </div>
          </div>
        </div>
        <div className="setting-item color-setting-item">
          <label>표 색상</label>
          <div className="color-button-group">
            <button
              className={`color-button ${textColor === 'white' ? 'selected' : ''}`}
              data-color="white"
              style={{ backgroundColor: 'white', borderColor: '#333' }}
              onClick={() => onTextColorChange('white')}
            />
            <button
              className={`color-button ${textColor === 'black' ? 'selected' : ''}`}
              data-color="black"
              style={{ backgroundColor: 'rgb(30,30,30)', borderColor: '#ccc' }}
              onClick={() => onTextColorChange('black')}
            />
          </div>
        </div>
      </div>

      {/* 2번 줄: 화질 | 강의명 글씨 크기 | 강의실 글씨 크기 | 요일/시간 글씨 크기 */}
      <div className="settings-row">
        <div className="setting-item">
          <label>화질</label>
          <select value={resolution} onChange={(e) => onResolutionChange(e.target.value)}>
            <option value="fhd">FHD (1920x1080)</option>
            <option value="qhd">QHD (2560x1440)</option>
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

      {/* 3번 줄: 가로 위치 | 세로 위치 | 가로 크기 | 세로 크기 */}
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
