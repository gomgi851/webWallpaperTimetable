function createSeededRng(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
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

  return { centers, counts: finalCounts, inertia: finalInertia };
}

function kMeansLikePython(samples, nClusters, randomState = 42, nInit = 10) {
  const k = Math.min(nClusters, samples.length);
  let best = null;

  for (let initIdx = 0; initIdx < nInit; initIdx++) {
    const rng = createSeededRng(randomState + initIdx);
    const initCenters = initKMeansPlusPlus(samples, k, rng);
    const result = runLloyd(samples, initCenters, 300, 1e-4);
    if (!best || result.inertia < best.inertia) best = result;
  }
  return best;
}

function toBlockColors(centers, counts, nColors) {
  const sorted = centers
    .map((center, idx) => ({ center, count: counts[idx], idx }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, nColors).map(({ center }) => {
    const r = center[0] / 255;
    const g = center[1] / 255;
    const b = center[2] / 255;

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

    s = Math.min(s * 1.2, 1.0);
    const vAdjusted = Math.min(v * 0.85, 1.0);

    const c = vAdjusted * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = vAdjusted - c;

    let nr = 0;
    let ng = 0;
    let nb = 0;

    if (h < 1 / 6) {
      nr = c; ng = x; nb = 0;
    } else if (h < 2 / 6) {
      nr = x; ng = c; nb = 0;
    } else if (h < 3 / 6) {
      nr = 0; ng = c; nb = x;
    } else if (h < 4 / 6) {
      nr = 0; ng = x; nb = c;
    } else if (h < 5 / 6) {
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
}

function extractPaletteFromRgba(data, nColors = 8, sampleRate = 10) {
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

  if (pixels.length === 0) {
    return {
      blockColors: [{ r: 100, g: 150, b: 200, a: 200 }],
      textColor: 'white',
      avgBrightness: 128
    };
  }

  const { centers, counts } = kMeansLikePython(pixels, nColors, 42, 10);
  const blockColors = toBlockColors(centers, counts, nColors);
  const avgBrightness = pixelCount > 0 ? allChannelsSum / (pixelCount * 3) : 128;
  const textColor = avgBrightness > 128 ? 'black' : 'white';

  return { blockColors, textColor, avgBrightness };
}

self.onmessage = (event) => {
  const { id, rgbaBuffer, nColors, sampleRate } = event.data || {};
  try {
    const data = new Uint8ClampedArray(rgbaBuffer);
    const result = extractPaletteFromRgba(data, nColors, sampleRate);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error?.message || 'palette worker failed' });
  }
};

