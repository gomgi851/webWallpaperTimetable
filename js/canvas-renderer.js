class TimetableRenderer {
  constructor(canvas, bgImage, courses, textColor, hPos, vPos, horizontalSizePercent, verticalSizePercent, courseNameFontSize = 20, courseRoomFontSize = 15, labelFontSize = 14, paletteColors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bgImage = bgImage;
    this.courses = courses;
    this.textColor = textColor === 'white' ? [255, 255, 255] : [30, 30, 30];
    this.hPos = hPos;
    this.vPos = vPos;
    this.horizontalSizePercent = horizontalSizePercent;
    this.verticalSizePercent = verticalSizePercent;
    this.courseNameFontSize = courseNameFontSize;
    this.courseRoomFontSize = courseRoomFontSize;
    this.labelFontSize = labelFontSize;
    // paletteColors는 필수
    this.colors = paletteColors;
  }

  // 배경 이미지 위치 계산
  calculateBgPosition() {
    const imgWidth = this.bgImage.width;
    const imgHeight = this.bgImage.height;
    
    // 캔버스 전체를 배경으로 채우기
    let scale = Math.max(this.canvas.width / imgWidth, this.canvas.height / imgHeight);
    let scaledWidth = imgWidth * scale;
    let scaledHeight = imgHeight * scale;
    
    // 중앙 정렬
    let x = (this.canvas.width - scaledWidth) / 2;
    let y = (this.canvas.height - scaledHeight) / 2;
    
    return {
      x: x,
      y: y,
      width: scaledWidth,
      height: scaledHeight
    };
  }

  render() {
    // 배경 이미지 그리기
    const bgPos = this.calculateBgPosition();
    this.ctx.drawImage(this.bgImage, bgPos.x, bgPos.y, bgPos.width, bgPos.height);
    
    // 시간표 영역 설정
    const timetableWidth = this.canvas.width * this.horizontalSizePercent;
    const timetableHeight = this.canvas.height * this.verticalSizePercent;
    const topMargin = 70; // 상단 마진 (요일이 잘리지 않도록)
    const timeLabelsMargin = 40; // 시간 레이블 여백
    
    let timetableX, timetableY;
    if (this.hPos === 'left') timetableX = timeLabelsMargin;
    else if (this.hPos === 'center') timetableX = (this.canvas.width - timetableWidth) / 2;
    else timetableX = this.canvas.width - timetableWidth;
    
    if (this.vPos === 'top') timetableY = topMargin;
    else if (this.vPos === 'center') timetableY = (this.canvas.height - timetableHeight) / 2;
    else timetableY = this.canvas.height - timetableHeight;
    
    // 클리핑 영역 설정
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(timetableX, timetableY, timetableWidth, timetableHeight);
    this.ctx.clip();
    
    // 시간표 렌더링
    this.drawTimetable(timetableX, timetableY, timetableWidth, timetableHeight);
    
    this.ctx.restore();
  }

  drawTimetable(x, y, width, height) {
    // 격자 그리기
    this.drawGrid(x, y, width, height);
    
    // 요일/시간 레이블
    this.drawLabels(x, y, width, height);
    
    // 강의 블록
    this.drawCourses(x, y, width, height);
  }

  drawGrid(x, y, width, height) {
    this.ctx.strokeStyle = 'rgba(180, 180, 180, 1)';
    this.ctx.lineWidth = 2;
    
    // 세로 선 (요일)
    for (let i = 0; i <= DAYS.length; i++) {
      const lineX = x + (i / DAYS.length) * width;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    
    // 가로 선 (시간)
    const hoursPerDay = 10; // 7:00 ~ 17:00
    for (let i = 0; i <= hoursPerDay; i++) {
      const lineY = y + (i / hoursPerDay) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
  }

  drawLabels(x, y, width, height) {
    // 요일 레이블
    this.ctx.fillStyle = `rgb(${this.textColor[0]}, ${this.textColor[1]}, ${this.textColor[2]})`;
    this.ctx.font = 'bold 14px Cafe24 Surround, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i < DAYS.length; i++) {
      const labelX = x + ((i + 0.5) / DAYS.length) * width;
      const labelY = y + height * 0.05;
      this.ctx.fillText(DAYS[i], labelX, labelY);
    }
    
    // 시간 레이블
    this.ctx.font = 'bold 12px Cafe24 Surround, sans-serif';
    this.ctx.textAlign = 'right';
    
    const hoursPerDay = 10;
    for (let i = 0; i <= hoursPerDay; i++) {
      const hour = 7 + i;
      const labelY = y + (i / hoursPerDay) * height;
      const labelX = x - 5;
      this.ctx.fillText(`${hour}:00`, labelX, labelY);
    }
  }

  drawCourses(x, y, width, height) {
    const hoursPerDay = 10; // 7:00 ~ 17:00 (10시간)
    const timeStart = 7 * 60;
    const timeEnd = 17 * 60;
    const timeRange = timeEnd - timeStart;
    
    let colorIndex = 0;
    
    for (let course of this.courses) {
      const dayIndex = DAYS.indexOf(course.day);
      if (dayIndex === -1) continue;
      
      const startTime = parseInt(course.startH) * 60 + parseInt(course.startM);
      const endTime = parseInt(course.endH) * 60 + parseInt(course.endM);
      
      // 시간 범위 확인
      if (startTime >= timeEnd || endTime <= timeStart) continue;
      
      const blockX = x + (dayIndex / DAYS.length) * width;
      const blockY = y + Math.max(0, ((startTime - timeStart) / timeRange)) * height;
      const blockWidth = width / DAYS.length;
      const blockHeight = ((Math.min(endTime, timeEnd) - Math.max(startTime, timeStart)) / timeRange) * height;
      
      // 블록 배경
      const color = this.colors[colorIndex % this.colors.length];
      this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
      this.ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
      
      // 블록 테두리
      this.ctx.strokeStyle = `rgba(${color.r - 20}, ${color.g - 20}, ${color.b - 20}, 1)`;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);
      
      // 텍스트
      this.drawCourseText(blockX, blockY, blockWidth, blockHeight, course);
      
      colorIndex++;
    }
  }

  drawCourseText(x, y, width, height, course) {
    const padding = 4;
    const textWidth = width - padding * 2;
    const textHeight = height - padding * 2;
    
    if (textWidth <= 0 || textHeight <= 0) return;
    
    // 강의명
    this.ctx.fillStyle = `rgb(${this.textColor[0]}, ${this.textColor[1]}, ${this.textColor[2]})`;
    this.ctx.font = 'bold 11px Cafe24 Surround, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    const nameLines = this.wrapTextInBox(this.ctx, course.name, textWidth, 11);
    nameLines.slice(0, 2).forEach((line, idx) => {
      this.ctx.fillText(line, x + padding, y + padding + idx * 16);
    });
    
    // 강의실
    this.ctx.font = 'normal 10px Cafe24 Surround, sans-serif';
    const roomY = Math.min(y + padding + nameLines.length * 16 + 2, y + height - padding - 10);
    this.ctx.fillText(course.room, x + padding, roomY);
  }

  wrapTextInBox(ctx, text, maxWidth, fontSize) {
    const lines = [];
    const words = text.split(' ');
    let currentLine = '';
    
    for (let word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
