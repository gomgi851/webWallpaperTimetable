import test from 'node:test';
import assert from 'node:assert/strict';
import {TimetableRenderer} from '../src/lib/canvas-renderer.js';

for (const [choice, rgb] of [['black', '30, 30, 30'], ['white', '255, 255, 255']]) {
  test(`${choice} applies to both grid weights, labels, course names and rooms`, () => {
    const strokes = [], texts = [];
    const ctx = {
      beginPath() {}, moveTo() {}, lineTo() {},
      stroke() { strokes.push(this.strokeStyle); },
      fillText(text) { texts.push({text, color: this.fillStyle}); },
      measureText(text) { return {width: text.length * 10}; },
    };
    const renderer = new TimetableRenderer(
      {width: 1920, getContext: () => ctx}, {}, [], choice,
      'right', 'top', .39, .77, 20, 15, 18,
      [{r: 100, g: 150, b: 200, a: 200}],
    );
    renderer.drawGrid(0, 0, 500, 300, 540, 600);
    assert.deepEqual([...new Set(strokes)], [`rgba(${rgb}, 0.13)`, `rgba(${rgb}, 0.09)`]);
    renderer.drawLabels(0, 0, 500, 300, 540, 600);
    assert.ok(texts.every(({color}) => color === `rgb(${rgb})`));
    texts.length = 0;
    renderer.drawCourseText(0, 0, 180, 120, {name: '수학', room: 'A101'});
    assert.deepEqual(texts, [
      {text: '수학', color: `rgb(${rgb})`},
      {text: 'A101', color: `rgba(${rgb}, 0.7)`},
    ]);
  });
}
