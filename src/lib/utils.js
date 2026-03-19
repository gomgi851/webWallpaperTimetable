// 날짜 관련 유틸리티
export const DAYS = ['월', '화', '수', '목', '금'];
export const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 7).padStart(2, '0'));
export const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

// 해상도 설정
export const RESOLUTIONS = {
  fhd: { width: 1920, height: 1080 },
  qhd: { width: 2560, height: 1440 },
  original: { width: null, height: null } // 배경화면 원본 크기 (동적 결정)
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

let paletteWorker = null;
let paletteRequestId = 0;

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

function createSeededRng(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sqDist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function initKMeansPlusPlus(samples, k, rng) {
  const centers = [];
  const firstIdx = Math.floor(rng() * samples.length);
  centers.push(samples[firstIdx].slice());

  while (centers.length < k) {
    const d2 = new Array(samples.length);
    let total = 0;

    for (let i = 0; i < samples.length; i++) {
      let minD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dist = sqDist(samples[i], centers[c]);
        if (dist < minD) minD = dist;
      }
      d2[i] = minD;
      total += minD;
    }

    if (total === 0) {
      const idx = Math.floor(rng() * samples.length);
      centers.push(samples[idx].slice());
      continue;
    }

    let target = rng() * total;
    let chosen = 0;
    for (let i = 0; i < d2.length; i++) {
      target -= d2[i];
      if (target <= 0) {
        chosen = i;
        break;
      }
    }
    centers.push(samples[chosen].slice());
  }

  return centers;
}

function runLloyd(samples, initCenters, maxIterations = 300, tolerance = 1e-4) {
  const k = initCenters.length;
  const centers = initCenters.map((c) => c.slice());
  const labels = new Array(samples.length).fill(0);

  let prevInertia = Infinity;

  for (let iter = 0; iter < maxIterations; iter++) {
    let inertia = 0;

    for (let i = 0; i < samples.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;

      for (let c = 0; c < k; c++) {
        const dist = sqDist(samples[i], centers[c]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = c;
        }
      }

      labels[i] = minIdx;
      inertia += minDist;
    }

    const sums = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = new Array(k).fill(0);

    for (let i = 0; i < samples.length; i++) {
      const c = labels[i];
      sums[c][0] += samples[i][0];
      sums[c][1] += samples[i][1];
      sums[c][2] += samples[i][2];
      counts[c] += 1;
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) continue;
      centers[c][0] = sums[c][0] / counts[c];
      centers[c][1] = sums[c][1] / counts[c];
      centers[c][2] = sums[c][2] / counts[c];
    }

    if (Math.abs(prevInertia - inertia) <= tolerance * prevInertia) {
      break;
    }
    prevInertia = inertia;
  }

  const finalCounts = new Array(k).fill(0);
  for (let i = 0; i < labels.length; i++) {
    finalCounts[labels[i]] += 1;
  }

  let finalInertia = 0;
  for (let i = 0; i < samples.length; i++) {
    finalInertia += sqDist(samples[i], centers[labels[i]]);
  }

  return { centers, labels, counts: finalCounts, inertia: finalInertia };
}

// Python sklearn KMeans(n_init=10, random_state=42)와 유사하게 동작하도록 구성
function kMeansLikePython(samples, nClusters, randomState = 42, nInit = 10) {
  const k = Math.min(nClusters, samples.length);
  let best = null;

  for (let initIdx = 0; initIdx < nInit; initIdx++) {
    const rng = createSeededRng(randomState + initIdx);
    const initCenters = initKMeansPlusPlus(samples, k, rng);
    const result = runLloyd(samples, initCenters, 300, 1e-4);

    if (!best || result.inertia < best.inertia) {
      best = result;
    }
  }

  return best;
}

function getPaletteWorker() {
  if (typeof Worker === 'undefined') return null;
  if (!paletteWorker) {
    paletteWorker = new Worker(new URL('./palette-worker.js', import.meta.url), { type: 'module' });
  }
  return paletteWorker;
}

export async function extractPaletteFromImageAsync(img, nColors = 8, sampleRate = 10) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const worker = getPaletteWorker();
  if (!worker) {
    return extractPaletteFromImage(img, nColors, sampleRate);
  }

  const id = ++paletteRequestId;
  return new Promise((resolve) => {
    const onMessage = (event) => {
      const payload = event.data || {};
      if (payload.id !== id) return;
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);

      if (payload.error) {
        resolve(extractPaletteFromImage(img, nColors, sampleRate));
        return;
      }
      resolve(payload.result);
    };

    const onError = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      resolve(extractPaletteFromImage(img, nColors, sampleRate));
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage(
      {
        id,
        nColors,
        sampleRate,
        rgbaBuffer: imageData.data.buffer
      },
      [imageData.data.buffer]
    );
  });
}

// 이미지에서 팔레트 추출 (파이썬 코드와 동일한 로직)
export function extractPaletteFromImage(img, nColors = 8, sampleRate = 10) {
  console.time('extractPaletteFromImage');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Python 코드와 동일: 리사이즈 없이 원본 크기 사용
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);
  
  console.log(`[팔레트] 이미지 크기: ${img.width}x${img.height}`);
  
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;
  
  console.time('픽셀 수집');
  
  // Python 코드와 동일:
  // 1) 전체 픽셀 brightness=(r+g+b)/3 계산 후 30~225 필터
  // 2) 필터된 배열에 sampleRate 간격 샘플링 적용
  const midPixels = [];
  let allChannelsSum = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    allChannelsSum += r + g + b;
    const brightness = (r + g + b) / 3;

    if (brightness > 30 && brightness < 225) {
      midPixels.push([r, g, b]);
    }
  }

  const pixels = [];
  for (let i = 0; i < midPixels.length; i += sampleRate) {
    pixels.push(midPixels[i]);
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
  
  // 2. Python sklearn KMeans와 유사한 설정
  const { centers, counts } = kMeansLikePython(pixels, nColors, 42, 10);
  
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
  
  // 5. Python 코드와 동일: 전체 픽셀 채널 평균 기준
  const avgBrightness = pixelCount > 0 ? allChannelsSum / (pixelCount * 3) : 128;
  const textColor = avgBrightness > 128 ? 'black' : 'white';
  
  console.log(`[팔레트] 추출 완료:`, blockColors.map(c => `RGB(${c.r},${c.g},${c.b})`));
  console.timeEnd('extractPaletteFromImage');
  
  return {
    blockColors,
    textColor,
    avgBrightness
  };
}
