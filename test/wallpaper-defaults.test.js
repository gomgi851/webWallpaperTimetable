import test from 'node:test';
import assert from 'node:assert/strict';
import {getWallpaperDefaults} from '../src/lib/wallpaper-defaults.js';

test('source dimensions choose a capped output tier and proportional font sizes', () => {
  for (const [width,height,resolution,fonts] of [
    [1920,1080,'fhd',[18,20,15]],
    [2560,1440,'qhd',[24,27,20]],
    [3840,2160,'uhd',[36,40,30]],
    [7680,4320,'uhd',[36,40,30]],
    [2160,3840,'uhd',[36,40,30]],
    [3440,1440,'qhd',[24,27,20]],
    [3840,2159,'uhd',[36,40,30]],
    [3840,1080,'uhd',[36,40,30]],
    [2559,1440,'fhd',[18,20,15]],
    [2560,1439,'qhd',[24,27,20]],
    [2560,1080,'qhd',[24,27,20]],
    [1280,720,'fhd',[18,20,15]],
  ]) {
    const actual=getWallpaperDefaults(width,height);
    assert.equal(actual.resolution,resolution);
    assert.deepEqual([actual.labelFontSize,actual.courseNameFontSize,actual.courseRoomFontSize],fonts);
    assert.equal(actual.horizontalSizePercent,39);
    assert.equal(actual.verticalSizePercent,77);
  }
  assert.throws(()=>getWallpaperDefaults(0,1080));
});
