import test from 'node:test';
import assert from 'node:assert/strict';
import {convertImportedCourses,formatTime,getAutomaticImport,formatImportedCourseName} from '../src/lib/timetable-ocr/import-courses.js';
const course={selected:true,day:'수',name:' 이산수학 ',roomCode:' L311 ',start:'14:00',end:'15:30'};
test('maps reviewed OCR fields into wallpaper course schema; ignores unselected invalid rows',()=>{
 assert.deepEqual(convertImportedCourses([course,{selected:false}],()=> 'new-id'),[{id:'new-id',day:'수',name:'이산수학',room:'L311',startH:'14',startM:'00',endH:'15',endM:'30'}]);
});
test('rejects unknown, backwards, off-grid and invalid times without inventing defaults',()=>{
 for(const edit of [{start:''},{end:''},{end:'13:00'},{end:'15:32'},{start:'24:00'},{day:'토'},{name:''}])assert.throws(()=>convertImportedCourses([{...course,...edit}]));
 assert.throws(()=>convertImportedCourses([{...course,selected:false}]));
 assert.equal(formatTime(null),'');assert.equal(formatTime(870),'14:30');
});
test('automatic replacement requires at least four complete courses; invalid courses do not count',()=>{
 const row={day:'월',name:'수학',roomCode:'A101',startMinutes:540,endMinutes:600};
 for(const count of [0,1,2,3])assert.throws(()=>getAutomaticImport(Array.from({length:count},()=>row)),/직접 입력/);
 assert.equal(getAutomaticImport(Array.from({length:4},()=>row),()=> 'id').length,4);
 assert.throws(()=>getAutomaticImport([...Array.from({length:3},()=>row),{...row,endMinutes:null}]),/직접 입력/);
 assert.equal(getAutomaticImport([...Array.from({length:4},()=>row),{...row,endMinutes:null}],()=> 'id').length,4);
});
test('photo imports add a space after six non-space characters only for names at least nine characters long',()=>{
 assert.equal(formatImportedCourseName('가나다라마바사아'),'가나다라마바사아');
 assert.equal(formatImportedCourseName('가나다라마바사아자'),'가나다라마바 사아자');
 assert.equal(formatImportedCourseName('가나다 라마바사아자'),'가나다 라마바 사아자');
 assert.equal(formatImportedCourseName('가나다라마바 사아자'),'가나다라마바 사아자');
 const row={...course,name:'가나다라마바사아자'};
 assert.equal(convertImportedCourses([row],()=> 'id')[0].name,'가나다라마바 사아자');
});
