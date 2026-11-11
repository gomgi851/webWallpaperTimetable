import test from 'node:test';
import assert from 'node:assert/strict';
import {getWallpaperDefaults,getResolutionDefaults} from '../src/lib/wallpaper-defaults.js';

test('original quality scales fonts to actual dimensions without a UHD cap',()=>{
  for(const [width,height,fonts] of [
    [1920,1080,[18,20,15]],
    [2560,1440,[24,27,20]],
    [3840,2160,[36,40,30]],
    [7680,4320,[72,80,60]],
    [2880,1620,[27,30,23]],
    [3440,1440,[24,27,20]],
    [2160,3840,[20,23,17]],
    [1280,720,[12,13,10]],
    [640,360,[8,8,8]],
  ]){
    const actual=getWallpaperDefaults(width,height);
    assert.equal(actual.resolution,'original');
    assert.deepEqual([actual.labelFontSize,actual.courseNameFontSize,actual.courseRoomFontSize],fonts);
    assert.equal(actual.horizontalSizePercent,39);assert.equal(actual.verticalSizePercent,77);
  }
  assert.throws(()=>getWallpaperDefaults(0,1080));
  assert.throws(()=>getWallpaperDefaults(NaN,1080));
});
test('manual FHD/QHD/UHD choices retain proportional presets',()=>{
  for(const [tier,fonts] of [['fhd',[18,20,15]],['qhd',[24,27,20]],['uhd',[36,40,30]]]){
    const actual=getResolutionDefaults(tier);
    assert.deepEqual([actual.labelFontSize,actual.courseNameFontSize,actual.courseRoomFontSize],fonts);
  }
});
