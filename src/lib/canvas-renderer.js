import { DAYS } from './utils.js';

export class TimetableRenderer {
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
    const topMargin = 70; // 상단 마진
    const timeLabelsMargin = 50; // 시간 레이블 여백
    
    let timetableX, timetableY;
    if (this.hPos === 'left') timetableX = timeLabelsMargin;
    else if (this.hPos === 'center') timetableX = (this.canvas.width - timetableWidth) / 2;
    else timetableX = this.canvas.width - timetableWidth;
    
    if (this.vPos === 'top') timetableY = topMargin;
    else if (this.vPos === 'center') timetableY = (this.canvas.height - timetableHeight) / 2;
    else timetableY = this.canvas.height - timetableHeight;
    
    const { timeStart, timeEnd } = this.getVisibleTimeRange();

    // 레이블 그리기 (클리핑 전)
    this.drawLabels(timetableX, timetableY, timetableWidth, timetableHeight, timeStart, timeEnd);
    
    // 클리핑 영역 설정 (그리드와 블록용)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(timetableX, timetableY, timetableWidth, timetableHeight);
    this.ctx.clip();
    
    // 그리드와 블록 렌더링
    this.drawGrid(timetableX, timetableY, timetableWidth, timetableHeight, timeStart, timeEnd);
    this.drawCourses(timetableX, timetableY, timetableWidth, timetableHeight, timeStart, timeEnd);
    
    this.ctx.restore();
  }

  drawTimetable(x, y, width, height) {
    const { timeStart, timeEnd } = this.getVisibleTimeRange();

    // 격자 그리기
    this.drawGrid(x, y, width, height, timeStart, timeEnd);
    
    // 요일/시간 레이블
    this.drawLabels(x, y, width, height, timeStart, timeEnd);
    
    // 강의 블록
    this.drawCourses(x, y, width, height, timeStart, timeEnd);
  }

  getVisibleTimeRange() {
    const validCourses = this.courses.filter((course) => {
      const startH = parseInt(course.startH, 10);
      const startM = parseInt(course.startM, 10);
      const endH = parseInt(course.endH, 10);
      const endM = parseInt(course.endM, 10);
      return [startH, startM, endH, endM].every((v) => Number.isFinite(v));
    });

    if (validCourses.length === 0) {
      return { timeStart: 420, timeEnd: 1020 };
    }

    const earliestStartMin = Math.min(
      ...validCourses.map((course) => parseInt(course.startH, 10) * 60 + parseInt(course.startM, 10))
    );
    const latestEndMin = Math.max(
      ...validCourses.map((course) => parseInt(course.endH, 10) * 60 + parseInt(course.endM, 10))
    );

    let startHour = Math.floor(earliestStartMin / 60);
    let endHour = Math.ceil(latestEndMin / 60);

    startHour = Math.max(0, Math.min(23, startHour));
    endHour = Math.max(startHour + 1, Math.min(24, endHour));

    return {
      timeStart: startHour * 60,
      timeEnd: endHour * 60
    };
  }

  drawGrid(x, y, width, height, timeStart, timeEnd) {
    // 그리드 색상: 첫 번째 색상(대표색) 기반, 매우 투명하게
    const dominantColor = this.colors[0];
    const gridColor = `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.08)`;
    const gridColorHalf = `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.04)`;
    
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 2;
    
    // 세로 선 (요일)
    for (let i = 0; i <= DAYS.length; i++) {
      const lineX = x + (i / DAYS.length) * width;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    
    const hourCount = Math.max(1, Math.round((timeEnd - timeStart) / 60));

    // 가로 선 (시간) - 정시
    for (let i = 0; i <= hourCount; i++) {
      const lineY = y + (i / hourCount) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }

    // 30분 선 (더 연하게)
    this.ctx.strokeStyle = gridColorHalf;
    this.ctx.lineWidth = 1;
    for (let i = 0; i < hourCount; i++) {
      const minuteFromStart = i * 60 + 30;
      const lineY = y + (minuteFromStart / (timeEnd - timeStart)) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
  }

  drawLabels(x, y, width, height, timeStart, timeEnd) {
    // 요일 레이블
    this.ctx.fillStyle = `rgb(${this.textColor[0]}, ${this.textColor[1]}, ${this.textColor[2]})`;
    this.ctx.font = `bold ${this.labelFontSize}px Cafe24 Surround, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let i = 0; i < DAYS.length; i++) {
      const labelX = x + ((i + 0.5) / DAYS.length) * width;
      const labelY = y - 30;
      this.ctx.fillText(DAYS[i], labelX, labelY);
    }

    // 시간 레이블
    this.ctx.font = `${Math.max(10, this.labelFontSize - 2)}px Cafe24 Surround, sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    const hourCount = Math.max(1, Math.round((timeEnd - timeStart) / 60));
    const startHour = Math.floor(timeStart / 60);

    for (let h = 0; h <= hourCount; h++) {
      const hour = startHour + h;
      const labelY = y + (h / hourCount) * height;
      this.ctx.fillText(`${hour}:00`, x - 15, labelY);
    }
  }

  drawCourses(x, y, width, height, timeStart, timeEnd) {
    const timeRange = timeEnd - timeStart;
    const padding = 8;
    const radius = 8;

    // 강의명별 색상 매핑 (같은 강의 = 같은 색)
    const colorMap = {};
    let colorIndex = 0;
    for (let course of this.courses) {
      if (!colorMap[course.name]) {
        colorMap[course.name] = this.colors[colorIndex % this.colors.length];
        colorIndex++;
      }
    }

    // 먼저 그림자 그리기
    for (let course of this.courses) {
      const dayIndex = DAYS.indexOf(course.day);
      if (dayIndex === -1) continue;

      const startTime = parseInt(course.startH) * 60 + parseInt(course.startM);
      const endTime = parseInt(course.endH) * 60 + parseInt(course.endM);

      if (startTime >= timeEnd || endTime <= timeStart) continue;

      const blockX = x + (dayIndex / DAYS.length) * width + padding;
      const blockY = y + Math.max(0, ((startTime - timeStart) / timeRange)) * height + padding;
      const blockWidth = width / DAYS.length - padding * 2;
      const blockHeight = ((Math.min(endTime, timeEnd) - Math.max(startTime, timeStart)) / timeRange) * height - padding;

      // 그림자
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 3;
      this.ctx.shadowOffsetY = 3;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.roundRect(blockX, blockY, blockWidth, blockHeight, radius);
      this.ctx.fill();
    }

    // 그림자 초기화
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;

    // 블록 그리기
    for (let course of this.courses) {
      const dayIndex = DAYS.indexOf(course.day);
      if (dayIndex === -1) continue;

      const startTime = parseInt(course.startH) * 60 + parseInt(course.startM);
      const endTime = parseInt(course.endH) * 60 + parseInt(course.endM);

      if (startTime >= timeEnd || endTime <= timeStart) continue;

      const blockX = x + (dayIndex / DAYS.length) * width + padding;
      const blockY = y + Math.max(0, ((startTime - timeStart) / timeRange)) * height + padding;
      const blockWidth = width / DAYS.length - padding * 2;
      const blockHeight = ((Math.min(endTime, timeEnd) - Math.max(startTime, timeStart)) / timeRange) * height - padding;

      // 블록 배경 (라운드 코너)
      const color = colorMap[course.name];
      this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
      this.roundRect(blockX, blockY, blockWidth, blockHeight, radius);
      this.ctx.fill();

      // 블록 테두리
      this.ctx.strokeStyle = `rgba(${Math.max(0, color.r - 30)}, ${Math.max(0, color.g - 30)}, ${Math.max(0, color.b - 30)}, 0.5)`;
      this.ctx.lineWidth = 2;
      this.roundRect(blockX, blockY, blockWidth, blockHeight, radius);
      this.ctx.stroke();

      // 텍스트
      this.drawCourseText(blockX, blockY, blockWidth, blockHeight, course);
    }
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  drawCourseText(x, y, width, height, course) {
    const padding = 6;
    const textWidth = width - padding * 2;
    const textHeight = height - padding * 2;

    if (textWidth <= 0 || textHeight <= 0) return;

    const nameLineHeight = Math.max(12, this.courseNameFontSize);
    const roomLineHeight = Math.max(10, this.courseRoomFontSize - 1);
    const minGap = Math.max(0, Math.round(this.courseRoomFontSize * 0.05));
    const availableHeight = textHeight;

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    this.ctx.font = `bold ${this.courseNameFontSize}px Cafe24 Surround, sans-serif`;
    const wrappedNameLines = this.wrapTextInBox(this.ctx, course.name, textWidth, this.courseNameFontSize);

    this.ctx.font = `${this.courseRoomFontSize}px Cafe24 Surround, sans-serif`;
    const wrappedRoomLines = this.wrapTextInBox(this.ctx, course.room || '', textWidth, this.courseRoomFontSize);

    let nameCount = Math.min(wrappedNameLines.length, 2);
    let roomCount = height > 70 && course.room ? Math.min(wrappedRoomLines.length, 2) : 0;

    let gap = roomCount > 0 && nameCount > 0 ? minGap : 0;
    let totalHeight = nameCount * nameLineHeight + roomCount * roomLineHeight + gap;

    if (totalHeight > availableHeight && roomCount > 1) {
      roomCount = 1;
      gap = roomCount > 0 && nameCount > 0 ? minGap : 0;
      totalHeight = nameCount * nameLineHeight + roomCount * roomLineHeight + gap;
    }
    if (totalHeight > availableHeight && nameCount > 1) {
      nameCount = 1;
      gap = roomCount > 0 && nameCount > 0 ? minGap : 0;
      totalHeight = nameCount * nameLineHeight + roomCount * roomLineHeight + gap;
    }
    if (totalHeight > availableHeight && roomCount > 0) {
      roomCount = 0;
      gap = 0;
      totalHeight = nameCount * nameLineHeight;
    }

    let currentY = y + padding + Math.max(0, (availableHeight - totalHeight) / 2);

    this.ctx.fillStyle = `rgb(${this.textColor[0]}, ${this.textColor[1]}, ${this.textColor[2]})`;
    this.ctx.font = `bold ${this.courseNameFontSize}px Cafe24 Surround, sans-serif`;
    for (let i = 0; i < nameCount; i++) {
      this.ctx.fillText(wrappedNameLines[i], x + width / 2, currentY);
      currentY += nameLineHeight;
    }

    if (roomCount > 0) {
      currentY += gap;
      this.ctx.font = `${this.courseRoomFontSize}px Cafe24 Surround, sans-serif`;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < roomCount; i++) {
        this.ctx.fillText(wrappedRoomLines[i], x + width / 2, currentY);
        currentY += roomLineHeight;
      }
    }
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
