import {RESOLUTIONS} from './utils.js';

export function getResolutionDefaults(resolution = 'fhd') {
  const size = RESOLUTIONS[resolution];
  const scale = size?.width ? size.width / RESOLUTIONS.fhd.width : 1;
  return {
    labelFontSize: Math.round(18 * scale),
    courseNameFontSize: Math.round(20 * scale),
    courseRoomFontSize: Math.round(15 * scale),
    // Percentages already scale with the output canvas dimensions.
    horizontalSizePercent: 39,
    verticalSizePercent: 77,
  };
}

export function getWallpaperDefaults(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('유효하지 않은 배경 이미지 크기입니다.');
  }
  // Use the long edge so ultrawide and portrait backgrounds get the same
  // output tier as landscape images of equivalent width.
  const longSide = Math.max(width, height);
  const resolution = longSide >= 3840 ? 'uhd' : longSide >= 2560 ? 'qhd' : 'fhd';
  return {resolution, ...getResolutionDefaults(resolution)};
}
