export function formatTime(minutes) {
  return Number.isInteger(minutes) && minutes >= 0 && minutes < 1440
    ? `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}` : '';
}

function parseTime(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [h, m] = value.split(':').map(Number);
  return m % 5 === 0 ? h * 60 + m : null;
}

export function formatImportedCourseName(name) {
  const text = name.trim();
  const characters = Array.from(text);
  if (characters.filter(c => !/\s/u.test(c)).length < 9) return text;
  let count = 0;
  const split = characters.findIndex(c => !/\s/u.test(c) && ++count === 6) + 1;
  return characters.slice(0, split).join('').trimEnd() + ' ' + characters.slice(split).join('').trimStart();
}

// Validate the entire selection before replacing or appending any saved classes.
export function convertImportedCourses(rows, makeId = () => crypto.randomUUID()) {
  const selected = rows.filter(row => row.selected);
  if (!selected.length) throw new Error('가져올 수업을 하나 이상 선택해주세요.');
  return selected.map((row, i) => {
    const start = parseTime(row.start), end = parseTime(row.end);
    if (!['월', '화', '수', '목', '금'].includes(row.day) || !row.name.trim() || start == null || end == null || end <= start) {
      throw new Error(`${i + 1}번째 선택 수업의 과목명·요일·시간을 확인해주세요. 시간은 5분 단위이며 종료가 시작보다 늦어야 합니다.`);
    }
    return {id: makeId(), day: row.day, name: formatImportedCourseName(row.name), room: row.roomCode.trim(),
      startH: row.start.slice(0, 2), startM: row.start.slice(3), endH: row.end.slice(0, 2), endM: row.end.slice(3)};
  });
}

// Only structurally usable classes count as recognition successes. This does
// not assert that OCR spelling is correct. Never replace existing classes below 4.
export function getAutomaticImport(classes, makeId = () => crypto.randomUUID()) {
  const valid=[];
  for(const course of classes || []) {
    try {
      valid.push(...convertImportedCourses([{selected:true,day:course.day,name:course.name||'',roomCode:course.roomCode||'',start:formatTime(course.startMinutes),end:formatTime(course.endMinutes)}], makeId));
    } catch { /* Incomplete/clipped rows do not count toward the threshold. */ }
  }
  if(valid.length<4)throw new Error('시간표를 4개 이상 인식하지 못했습니다. 수업 정보를 직접 입력해주세요.');
  return valid;
}
