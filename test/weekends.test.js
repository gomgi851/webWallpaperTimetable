import test from 'node:test';
import assert from 'node:assert/strict';
import {detectGeometry,blockTimes} from '../src/lib/timetable-ocr/geometry.js';
import {convertImportedCourses,getAutomaticImport} from '../src/lib/timetable-ocr/import-courses.js';
import {DAYS,getVisibleDays} from '../src/lib/utils.js';
import {TimetableRenderer} from '../src/lib/canvas-renderer.js';

function table(count) {
  const width=700,height=1000,data=new Uint8ClampedArray(width*height*4);
  const fill=(x,y,w,h,color)=>{for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){const i=(row*width+col)*4;data.set([...color,255],i);}};
  fill(0,0,width,height,[16,16,16]);
  for(let y=200;y<=900;y+=100)fill(20,y,660,2,[48,48,48]);
  const colWidth=630/count,days=[0,1,count-2,count-1];
  days.forEach((day,i)=>fill(Math.round(50+day*colWidth)+2,202+i*100,Math.floor(colWidth)-4,95,[180+i*8,110,100]));
  return {width,height,data};
}

for(const count of [5,6,7])test(`detects ${count} columns without remapping the final day`,()=>{
  const g=detectGeometry(table(count));
  assert.equal(g.dayCount,count);
  assert.deepEqual(g.blocks.map(b=>b.day).sort((a,b)=>a-b),[0,1,count-2,count-1]);
});

test('uses local grid spacing and retains 10/15/50 minute boundaries',()=>{
  const g={top:200,hourHeight:100,lines:[200,300,401,501,602,702,802]};
  assert.deepEqual(blockTimes({y:401+101/6,height:101*(.75-1/6)},g,9),{startMinutes:670,endMinutes:705});
  assert.deepEqual(blockTimes({y:501,height:101*5/6},g,9),{startMinutes:720,endMinutes:770});
});

test('weekend imports retain days and subhour times through automatic replacement',()=>{
  for(const day of ['토','일']) {
    const row={selected:true,day,name:'주말수업',roomCode:'A101',start:'11:10',end:'12:15'};
    const [course]=convertImportedCourses([row],()=> 'id');
    assert.equal(course.day,day);assert.equal(course.startM,'10');assert.equal(course.endM,'15');
    const imported=getAutomaticImport(Array.from({length:4},()=>({day,name:row.name,startMinutes:670,endMinutes:735})),()=> 'id');
    assert.ok(imported.every(c=>c.day===day));
  }
});

test('renderer uses five, six or seven columns according to included courses',()=>{
  for(const [day,count] of [['금',5],['토',6],['일',7]]) {
    const courses=[{day}],labels=[];
    const ctx={fillText:text=>labels.push(text)};
    const renderer=new TimetableRenderer({width:1920,getContext:()=>ctx},{},courses,'white');
    assert.deepEqual(renderer.days,DAYS.slice(0,count));
    renderer.drawLabels(0,0,700,600,540,600);
    assert.deepEqual(labels.slice(0,count),DAYS.slice(0,count));
  }
  assert.equal(getVisibleDays([]).length,5);
});
