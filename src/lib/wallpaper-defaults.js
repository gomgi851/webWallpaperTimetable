import {RESOLUTIONS} from './utils.js';

export function getResolutionDefaults(resolution = 'fhd') {
  const size = RESOLUTIONS[resolution];
  return getSizeDefaults(size?.width || 1920, size?.height || 1080);
}

function getSizeDefaults(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('유효하지 않은 배경 이미지 크기입니다.');
  }
  // Fit the FHD reference into the actual canvas, including non-16:9 images.
  const scale = Math.min(width / RESOLUTIONS.fhd.width, height / RESOLUTIONS.fhd.height);
  return {
    labelFontSize: Math.max(8, Math.round(18 * scale)),
    courseNameFontSize: Math.max(8, Math.round(20 * scale)),
    courseRoomFontSize: Math.max(8, Math.round(15 * scale)),
    // Percentages already scale with the output canvas dimensions.
    horizontalSizePercent: 39,
    verticalSizePercent: 77,
  };
}

export function getWallpaperDefaults(width, height) {
  return {resolution: 'original', ...getSizeDefaults(width, height)};
}
