import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Toast from './components/Toast';
import Settings from './components/Settings';
import ScheduleInput from './components/ScheduleInput';
import Preview from './components/Preview';
import { RESOLUTIONS, extractPaletteFromImageAsync } from './lib/utils';

const STORAGE_KEY = 'timetable_settings';

export default function App() {
  const [classes, setClasses] = useState([
    {
      id: Math.random(),
      day: '월',
      name: '데이터베이스',
      startH: '10',
      startM: '00',
      endH: '11',
      endM: '30',
      room: 'N101'
    },
    {
      id: Math.random(),
      day: '화',
      name: '모바일프로그래밍',
      startH: '13',
      startM: '00',
      endH: '14',
      endM: '30',
      room: 'N104'
    },
    {
      id: Math.random(),
      day: '목',
      name: '웹프로그래밍',
      startH: '10',
      startM: '00',
      endH: '11',
      endM: '30',
      room: 'N107'
    },
    {
      id: Math.random(),
      day: '금',
      name: '네트워크',
      startH: '14',
      startM: '00',
      endH: '15',
      endM: '30',
      room: 'N110'
    }
  ]);
  const [textColor, setTextColor] = useState('white');
  const [hPos, setHPos] = useState('right');
  const [vPos, setVPos] = useState('top');
  const [resolution, setResolution] = useState('fhd');
  const [horizontalSizePercent, setHorizontalSizePercent] = useState(39);
  const [verticalSizePercent, setVerticalSizePercent] = useState(70);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [bgImage, setBgImage] = useState(null);
  const [bgFileName, setBgFileName] = useState('');
  const [bgImageOriginalWidth, setBgImageOriginalWidth] = useState(0);
  const [bgImageOriginalHeight, setBgImageOriginalHeight] = useState(0);
  const [isBgProcessing, setIsBgProcessing] = useState(false);
  const [courseNameFontSize, setCourseNameFontSize] = useState(20);
  const [courseRoomFontSize, setCourseRoomFontSize] = useState(15);
  const [labelFontSize, setLabelFontSize] = useState(14);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [paletteColors, setPaletteColors] = useState([
    { r: 100, g: 181, b: 246, a: 200 },
    { r: 41, g: 182, b: 246, a: 200 },
    { r: 30, g: 136, b: 229, a: 200 },
    { r: 21, g: 99, b: 194, a: 200 },
    { r: 13, g: 71, b: 161, a: 200 },
    { r: 92, g: 107, b: 192, a: 200 }
  ]);
  const bgProcessTokenRef = useRef(0);

  // Toast 표시 함수
  const showToast = (message, type = 'info') => {
    setToastType(type);
    setToastMessage(message);
  };

  // localStorage에서 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setClasses(data.classes || []);
        setTextColor(data.textColor || 'white');
        setHPos(data.hPos || 'right');
        setVPos(data.vPos || 'top');
        setResolution(data.resolution || 'fhd');
        setHorizontalSizePercent(data.horizontalSizePercent || 39);
        setVerticalSizePercent(data.verticalSizePercent || 70);
        setCustomWidth(data.customWidth || 1920);
        setCustomHeight(data.customHeight || 1080);
        setCourseNameFontSize(data.courseNameFontSize || 20);
        setCourseRoomFontSize(data.courseRoomFontSize || 15);
        setLabelFontSize(data.labelFontSize || 14);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // 개발 도구용: window.showToast 노출
  useEffect(() => {
    window.showToast = showToast;
    return () => {
      delete window.showToast;
    };
  }, [showToast]);

  // 상태 변경 시 localStorage에 저장
  const saveState = () => {
    const dataToSave = {
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
      labelFontSize
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  useEffect(() => {
    saveState();
  }, [classes, textColor, hPos, vPos, resolution, horizontalSizePercent, verticalSizePercent, customWidth, customHeight, courseNameFontSize, courseRoomFontSize, labelFontSize]);

  const addClass = () => {
    const newClass = {
      id: Math.random(),
      day: '월',
      name: '',
      startH: '09',
      startM: '00',
      endH: '10',
      endM: '00',
      room: ''
    };
    setClasses([...classes, newClass]);
  };

  const updateClass = (id, field, value) => {
    setClasses(classes.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const deleteClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleBgImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 확인 (20MB 제한)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      showToast('파일 크기가 20MB를 초과합니다. 더 작은 이미지를 선택해주세요.', 'error');
      return;
    }

    const currentToken = ++bgProcessTokenRef.current;

    setBgFileName(file.name);
    setIsBgProcessing(true);
    showToast('색상 추출 중입니다. 잠시만 기다려주세요.', 'info');

    const reader = new FileReader();
    reader.onerror = () => {
      if (bgProcessTokenRef.current !== currentToken) return;
      setIsBgProcessing(false);
      showToast('이미지 파일을 읽는 중 오류가 발생했습니다.', 'error');
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        if (bgProcessTokenRef.current !== currentToken) return;
        setIsBgProcessing(false);
        showToast('이미지를 불러오는 중 오류가 발생했습니다.', 'error');
      };
      img.onload = async () => {
        try {
          if (bgProcessTokenRef.current !== currentToken) return;
          setBgImage(img);
          setBgImageOriginalWidth(img.width);
          setBgImageOriginalHeight(img.height);
          await new Promise((resolve) => requestAnimationFrame(resolve));

          // 팔레트 추출
          const palette = await extractPaletteFromImageAsync(img, 8, 10);
          if (bgProcessTokenRef.current !== currentToken) return;
          setPaletteColors(palette.blockColors);
          setTextColor(palette.textColor);
          showToast('배경화면 생성 준비 완료.', 'success');
        } finally {
          if (bgProcessTokenRef.current !== currentToken) return;
          setIsBgProcessing(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResolutionChange = (newResolution) => {
    // "custom" 선택 시: 현재 해상도의 크기를 customWidth/Height에 입력
    if (newResolution === 'custom') {
      if (resolution === 'original') {
        // 원본에서 커스텀으로: 원본 크기 입력
        setCustomWidth(bgImageOriginalWidth);
        setCustomHeight(bgImageOriginalHeight);
      } else {
        // FHD/QHD 등에서 커스텀으로: 해당 해상도 크기 입력
        const currentRes = RESOLUTIONS[resolution];
        setCustomWidth(currentRes.width);
        setCustomHeight(currentRes.height);
      }
    }

    // "original" 선택 시: 배경 이미지 확인
    if (newResolution === 'original') {
      if (!bgImage) {
        showToast('배경화면 이미지를 먼저 선택해주세요.', 'warning');
        return;
      }
    }

    setResolution(newResolution);
  };

  return (
    <div className="container">
      {toastMessage && (
        <div className="toast-container">
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>시간표 배경 생성기</h1>
        <a href="https://github.com/gomgi851" target="_blank" rel="noopener noreferrer" title="GitHub">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#1a1a1a' }}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>

      <Settings
        bgFileName={bgFileName}
        onBgImageChange={handleBgImage}
        resolution={resolution}
        onResolutionChange={handleResolutionChange}
        textColor={textColor}
        onTextColorChange={setTextColor}
        hPos={hPos}
        onHPosChange={setHPos}
        vPos={vPos}
        onVPosChange={setVPos}
        horizontalSizePercent={horizontalSizePercent}
        onHorizontalSizePercentChange={setHorizontalSizePercent}
        verticalSizePercent={verticalSizePercent}
        onVerticalSizePercentChange={setVerticalSizePercent}
        customWidth={customWidth}
        onCustomWidthChange={setCustomWidth}
        customHeight={customHeight}
        onCustomHeightChange={setCustomHeight}
        courseNameFontSize={courseNameFontSize}
        onCourseNameFontSizeChange={setCourseNameFontSize}
        courseRoomFontSize={courseRoomFontSize}
        onCourseRoomFontSizeChange={setCourseRoomFontSize}
        labelFontSize={labelFontSize}
        onLabelFontSizeChange={setLabelFontSize}
      />

      <ScheduleInput
        classes={classes}
        onAddClass={addClass}
        onUpdateClass={updateClass}
        onDeleteClass={deleteClass}
      />

      <Preview
        bgImage={bgImage}
        isBgProcessing={isBgProcessing}
        classes={classes}
        textColor={textColor}
        hPos={hPos}
        vPos={vPos}
        resolution={resolution}
        horizontalSizePercent={horizontalSizePercent}
        verticalSizePercent={verticalSizePercent}
        customWidth={customWidth}
        customHeight={customHeight}
        courseNameFontSize={courseNameFontSize}
        courseRoomFontSize={courseRoomFontSize}
        labelFontSize={labelFontSize}
        paletteColors={paletteColors}
        onShowToast={showToast}
      />
    </div>
  );
}
