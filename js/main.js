// 전역 상태
let state = {
  bgImage: null,
  classes: [
    { day: '월', name: '자료구조', startH: '10', startM: '00', endH: '11', endM: '00', room: '신공학관 401-6119' },
    { day: '수', name: '아산수학', startH: '11', startM: '00', endH: '12', endM: '00', room: '원보문화관 408-321' },
    { day: '목', name: '자료구조', startH: '10', startM: '00', endH: '11', endM: '00', room: '신공학관 401-6119' }
  ],
  textColor: 'white',
  hPos: 'right',
  vPos: 'top',
  resolution: 'fhd',
  sizePercent: 78,
  customWidth: 1920,
  customHeight: 1080
};

// 로컬스토리지 키
const STORAGE_KEY = 'timetable_settings';

// 로컬스토리지에 저장
function saveState() {
  const dataToSave = {
    classes: state.classes,
    textColor: state.textColor,
    hPos: state.hPos,
    vPos: state.vPos,
    resolution: state.resolution,
    sizePercent: state.sizePercent,
    customWidth: state.customWidth,
    customHeight: state.customHeight
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

// 로컬스토리지에서 로드
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.classes = data.classes || state.classes;
      state.textColor = data.textColor || state.textColor;
      state.hPos = data.hPos || state.hPos;
      state.vPos = data.vPos || state.vPos;
      state.resolution = data.resolution || state.resolution;
      state.sizePercent = data.sizePercent || state.sizePercent;
      state.customWidth = data.customWidth || state.customWidth;
      state.customHeight = data.customHeight || state.customHeight;
    } catch (e) {
      console.error('로컬스토리지 로드 실패:', e);
    }
  }
}

// DOM 요소
const bgFileInput = document.getElementById('bg-file-input');
const fileNameSpan = document.getElementById('file-name');
const resolutionSelect = document.getElementById('resolution');
const customSizeRow = document.querySelector('.custom-size-row');
const customWidthInput = document.getElementById('custom-width');
const customHeightInput = document.getElementById('custom-height');
const colorButtons = document.querySelectorAll('.color-button');
const hPosSelect = document.getElementById('h-pos');
const vPosSelect = document.getElementById('v-pos');
const sizePercentInput = document.getElementById('size-percent');
const schedulesContainer = document.getElementById('schedules-container');
const addClassBtn = document.getElementById('add-class-btn');
const generateBtn = document.getElementById('generate-btn');
const resultContainer = document.getElementById('result-container');
const previewCanvas = document.getElementById('preview-canvas');
const downloadBtn = document.getElementById('download-btn');

// 배경 이미지 업로드
bgFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  fileNameSpan.textContent = file.name;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      state.bgImage = img;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// 해상도 변경
resolutionSelect.addEventListener('change', (e) => {
  state.resolution = e.target.value;
  if (state.resolution === 'custom') {
    customSizeRow.style.display = 'flex';
    state.customWidth = 1920;
    state.customHeight = 1080;
  } else {
    customSizeRow.style.display = 'none';
  }
  saveState();
});

// 색상 선택
colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    colorButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.textColor = btn.dataset.color;
    
    // 보더 색상 업데이트
    if (state.textColor === 'white') {
      btn.style.borderColor = '#333';
    } else {
      btn.style.borderColor = '#fff';
    }
    saveState();
  });
});

// 위치 선택
hPosSelect.addEventListener('change', (e) => {
  state.hPos = e.target.value;
  saveState();
});

vPosSelect.addEventListener('change', (e) => {
  state.vPos = e.target.value;
  saveState();
});

// 크기 조절
sizePercentInput.addEventListener('change', (e) => {
  state.sizePercent = parseInt(e.target.value);
  saveState();
});

customWidthInput.addEventListener('change', (e) => {
  state.customWidth = parseInt(e.target.value);
  saveState();
});

customHeightInput.addEventListener('change', (e) => {
  state.customHeight = parseInt(e.target.value);
  saveState();
});

// 수업 정보 렌더링
function renderSchedules() {
  schedulesContainer.innerHTML = '';
  
  state.classes.forEach((cls, idx) => {
    const row = document.createElement('div');
    row.className = 'row';
    
    row.innerHTML = `
      <select class="day-select" value="${cls.day}">
        ${DAYS.map(d => `<option value="${d}" ${d === cls.day ? 'selected' : ''}>${d}</option>`).join('')}
      </select>
      <input type="text" class="name-input" value="${cls.name}" placeholder="강의명">
      <div class="time-select-group">
        <select class="start-h" value="${cls.startH}">
          ${HOURS.map(h => `<option value="${h}" ${h === cls.startH ? 'selected' : ''}>${h}시</option>`).join('')}
        </select>
        <select class="start-m" value="${cls.startM}">
          ${MINUTES.map(m => `<option value="${m}" ${m === cls.startM ? 'selected' : ''}>${m}분</option>`).join('')}
        </select>
        <span class="time-dash">~</span>
        <select class="end-h" value="${cls.endH}">
          ${HOURS.map(h => `<option value="${h}" ${h === cls.endH ? 'selected' : ''}>${h}시</option>`).join('')}
        </select>
        <select class="end-m" value="${cls.endM}">
          ${MINUTES.map(m => `<option value="${m}" ${m === cls.endM ? 'selected' : ''}>${m}분</option>`).join('')}
        </select>
      </div>
      <input type="text" class="room-input" value="${cls.room}" placeholder="강의실">
      <button class="delete-btn" data-index="${idx}">X</button>
    `;
    
    // 이벤트 핸들러
    row.querySelector('.day-select').addEventListener('change', (e) => {
      state.classes[idx].day = e.target.value;
      saveState();
    });
    
    row.querySelector('.name-input').addEventListener('change', (e) => {
      state.classes[idx].name = e.target.value;
      saveState();
    });
    
    row.querySelector('.start-h').addEventListener('change', (e) => {
      state.classes[idx].startH = e.target.value;
      saveState();
    });
    
    row.querySelector('.start-m').addEventListener('change', (e) => {
      state.classes[idx].startM = e.target.value;
      saveState();
    });
    
    row.querySelector('.end-h').addEventListener('change', (e) => {
      state.classes[idx].endH = e.target.value;
      saveState();
    });
    
    row.querySelector('.end-m').addEventListener('change', (e) => {
      state.classes[idx].endM = e.target.value;
      saveState();
    });
    
    row.querySelector('.room-input').addEventListener('change', (e) => {
      state.classes[idx].room = e.target.value;
      saveState();
    });
    
    row.querySelector('.delete-btn').addEventListener('click', () => {
      state.classes.splice(idx, 1);
      saveState();
      renderSchedules();
    });
    
    schedulesContainer.appendChild(row);
  });
}

// 수업 추가
addClassBtn.addEventListener('click', () => {
  state.classes.push({
    day: '월',
    name: '',
    startH: '09',
    startM: '00',
    endH: '10',
    endM: '30',
    room: ''
  });
  saveState();
  renderSchedules();
});

// 배경화면 생성
generateBtn.addEventListener('click', async () => {
  if (!state.bgImage) {
    alert('배경화면 이미지를 선택해주세요.');
    return;
  }
  
  generateBtn.disabled = true;
  generateBtn.textContent = '생성 중...';
  
  // 캔버스 크기 설정
  let width, height;
  if (state.resolution === 'custom') {
    width = state.customWidth;
    height = state.customHeight;
  } else {
    const res = RESOLUTIONS[state.resolution];
    width = res.width;
    height = res.height;
  }
  
  previewCanvas.width = width;
  previewCanvas.height = height;
  
  // 렌더링
  const renderer = new TimetableRenderer(
    previewCanvas,
    state.bgImage,
    state.classes,
    state.textColor,
    state.hPos,
    state.vPos,
    state.sizePercent / 100
  );
  
  renderer.render();
  
  // 다운로드 버튼 설정
  downloadBtn.href = previewCanvas.toDataURL('image/png');
  
  // 결과 표시
  resultContainer.style.display = 'block';
  
  generateBtn.disabled = false;
  generateBtn.textContent = '배경화면 생성하기';
});

// 초기화
loadState();
renderSchedules();

// UI 상태 반영
resolutionSelect.value = state.resolution;
if (state.resolution === 'custom') {
  customSizeRow.style.display = 'flex';
} else {
  customSizeRow.style.display = 'none';
}

hPosSelect.value = state.hPos;
vPosSelect.value = state.vPos;
sizePercentInput.value = state.sizePercent;
customWidthInput.value = state.customWidth;
customHeightInput.value = state.customHeight;

// 색상 버튼 UI 반영
colorButtons.forEach(btn => {
  if (btn.dataset.color === state.textColor) {
    btn.classList.add('selected');
    if (state.textColor === 'white') {
      btn.style.borderColor = '#333';
    } else {
      btn.style.borderColor = '#fff';
    }
  } else {
    btn.classList.remove('selected');
    btn.style.borderColor = '#ccc';
  }
});
