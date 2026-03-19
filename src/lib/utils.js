// 날짜 관련 유틸리티
export const DAYS = ['월', '화', '수', '목', '금'];
export const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 7).padStart(2, '0'));
export const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

// 해상도 설정
export const RESOLUTIONS = {
  fhd: { width: 1920, height: 1080 },
  qhd: { width: 2560, height: 1440 }
};

// 시간표 색상 (RGBA)
export const TIMETABLE_COLORS = [
  { r: 100, g: 181, b: 246, a: 200 },
  { r: 41, g: 182, b: 246, a: 200 },
  { r: 30, g: 136, b: 229, a: 200 },
  { r: 21, g: 99, b: 194, a: 200 },
  { r: 13, g: 71, b: 161, a: 200 },
  { r: 92, g: 107, b: 192, a: 200 }
];

// RGB 색상 문자열 생성
export function rgbaString(r, g, b, a = 255) {
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

// 날짜별로 강의 분류
export function groupCoursesByDay(courses) {
  const grouped = {};
  DAYS.forEach(day => {
    grouped[day] = courses.filter(c => c.day === day);
  });
  return grouped;
}

// 시간 범위 생성
export function getTimeRange(startH, startM, endH, endM) {
  const start = parseInt(startH) * 60 + parseInt(startM);
  const end = parseInt(endH) * 60 + parseInt(endM);
  return { start, end };
}

// 시간과 요일로부터 위치 계산
export function calculatePosition(day, start, end, gridWidth, gridHeight, timeStart = 420, timeEnd = 1020) {
  // timeStart = 7:00 (420분), timeEnd = 17:00 (1020분)
  const dayIndex = DAYS.indexOf(day);
  const x = dayIndex / DAYS.length * gridWidth;
  
  const timeRange = timeEnd - timeStart;
  const y = (start - timeStart) / timeRange * gridHeight;
  
  const width = gridWidth / DAYS.length;
  const height = ((end - start) / timeRange) * gridHeight;
  
  return { x, y, width, height };
}

// 간단한 K-Means 클러스터링
function kMeans(pixels, nClusters, maxIterations = 10) {
  // 초기 센터: 랜덤 선택
  const centers = [];
  for (let i = 0; i < nClusters; i++) {
    const randomIdx = Math.floor(Math.random() * pixels.length);
    centers.push([pixels[randomIdx].r, pixels[randomIdx].g, pixels[randomIdx].b]);
  }
  
  let labels = new Array(pixels.length);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // 각 픽셀을 가장 가까운 센터에 할당
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let closestCenter = 0;
      
      for (let c = 0; c < centers.length; c++) {
        const dr = pixels[i].r - centers[c][0];
        const dg = pixels[i].g - centers[c][1];
        const db = pixels[i].b - centers[c][2];
        const dist = dr * dr + dg * dg + db * db;
        
        if (dist < minDist) {
          minDist = dist;
          closestCenter = c;
        }
      }
      labels[i] = closestCenter;
    }
    
    // 센터 업데이트
    const newCenters = Array.from({ length: nClusters }, () => [0, 0, 0]);
    const counts = new Array(nClusters).fill(0);
    
    for (let i = 0; i < pixels.length; i++) {
      const label = labels[i];
      newCenters[label][0] += pixels[i].r;
      newCenters[label][1] += pixels[i].g;
      newCenters[label][2] += pixels[i].b;
      counts[label]++;
    }
    
    for (let c = 0; c < nClusters; c++) {
      if (counts[c] > 0) {
        centers[c][0] = Math.round(newCenters[c][0] / counts[c]);
        centers[c][1] = Math.round(newCenters[c][1] / counts[c]);
        centers[c][2] = Math.round(newCenters[c][2] / counts[c]);
      }
    }
  }
  
  // 각 센터의 빈도수 계산
  const counts = new Array(nClusters).fill(0);
  for (let i = 0; i < labels.length; i++) {
    counts[labels[i]]++;
  }
  
  // 센터와 빈도수를 함께 반환
  return { centers, counts };
}

// 이미지에서 팔레트 추출 (파이썬 코드와 동일한 로직)
export function extractPaletteFromImage(img, nColors = 8, sampleRate = 10) {
  console.time('extractPaletteFromImage');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 큰 이미지는 리사이징해서 처리 (성능 개선)
  let imgWidth = img.width;
  let imgHeight = img.height;
  const maxDimension = 512;
  
  if (imgWidth > maxDimension || imgHeight > maxDimension) {
    const scale = Math.min(maxDimension / imgWidth, maxDimension / imgHeight);
    imgWidth = Math.round(imgWidth * scale);
    imgHeight = Math.round(imgHeight * scale);
  }
  
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  
  console.log(`[팔레트] 이미지 크기: ${imgWidth}x${imgHeight}`);
  
  const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
  const data = imageData.data;
  
  console.time('픽셀 수집');
  
  // 1. 픽셀 수집: 밝기 30~225 범위만, 샘플링 적용
  const pixels = [];
  let totalBrightness = 0;
  
  // 초기 수집시부터 적극적 샘플링: 처음부터 30개마다만 우선 검사
  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    
    if (brightness > 30 && brightness < 225) {
      pixels.push({ r, g, b });
      totalBrightness += brightness;
    }
  }
  
  console.timeEnd('픽셀 수집');
  console.log(`[팔레트] 수집된 픽셀: ${pixels.length}개`);
  
  if (pixels.length === 0) {
    console.warn('[팔레트] 유효한 픽셀이 없습니다.');
    return {
      blockColors: [{ r: 100, g: 150, b: 200, a: 200 }],
      textColor: 'white',
      avgBrightness: 128
    };
  }
  
  console.time('K-Means 클러스터링');
  
  // 2. K-Means 클러스터링 (반복 3회로 줄임)
  const { centers, counts } = kMeans(pixels, nColors, 3);
  
  console.timeEnd('K-Means 클러스터링');
  
  // 3. 빈도수로 정렬
  const sorted = centers
    .map((center, idx) => ({ center, count: counts[idx], idx }))
    .sort((a, b) => b.count - a.count);
  
  console.time('색상 변환');
  
  // 4. 각 센터를 HSV 조정하여 블록 색상 생성
  const blockColors = sorted.slice(0, nColors).map(({ center }) => {
    const r = center[0] / 255;
    const g = center[1] / 255;
    const b = center[2] / 255;
    
    // RGB to HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    const v = max;
    
    if (delta !== 0) {
      s = delta / max;
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }
    
    // 파이썬 코드: s = min(s * 1.2, 1.0), v = min(v * 0.85, 1.0)
    s = Math.min(s * 1.2, 1.0);
    const vAdjusted = Math.min(v * 0.85, 1.0);
    
    // HSV to RGB
    const c = vAdjusted * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = vAdjusted - c;
    
    let nr = 0, ng = 0, nb = 0;
    
    if (h < 1/6) {
      nr = c; ng = x; nb = 0;
    } else if (h < 2/6) {
      nr = x; ng = c; nb = 0;
    } else if (h < 3/6) {
      nr = 0; ng = c; nb = x;
    } else if (h < 4/6) {
      nr = 0; ng = x; nb = c;
    } else if (h < 5/6) {
      nr = x; ng = 0; nb = c;
    } else {
      nr = c; ng = 0; nb = x;
    }
    
    return {
      r: Math.round((nr + m) * 255),
      g: Math.round((ng + m) * 255),
      b: Math.round((nb + m) * 255),
      a: 200
    };
  });
  
  console.timeEnd('색상 변환');
  
  // 5. 글자색 결정: 배경 평균 밝기 기준
  const avgBrightness = pixels.length > 0 ? totalBrightness / pixels.length : 128;
  const textColor = avgBrightness > 128 ? 'black' : 'white';
  
  console.log(`[팔레트] 추출 완료:`, blockColors.map(c => `RGB(${c.r},${c.g},${c.b})`));
  console.timeEnd('extractPaletteFromImage');
  
  return {
    blockColors,
    textColor,
    avgBrightness
  };
}
