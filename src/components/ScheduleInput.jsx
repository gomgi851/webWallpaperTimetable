import React, { useState } from 'react';
import { DAYS, HOURS, MINUTES } from '../lib/utils';

const AMPM_OPTIONS = ['오전', '오후'];
const HOUR_12_OPTIONS_AM = ['07', '08', '09', '10', '11'];
const HOUR_12_OPTIONS_PM = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];

function toPickerValue(hour24, minute) {
  const h = Number.parseInt(hour24, 10);
  const m = Number.parseInt(minute, 10);

  const safeHour = Number.isNaN(h) ? 9 : h;
  const safeMinute = Number.isNaN(m) ? '00' : String(Math.max(0, Math.min(55, m))).padStart(2, '0');

  // 오전: 07:00 ~ 11:59
  if (safeHour >= 7 && safeHour <= 11) {
    return { ampm: '오전', hour12: String(safeHour).padStart(2, '0'), minute: safeMinute };
  }
  
  // 오후: 12:00 ~ 23:59
  if (safeHour === 12) {
    return { ampm: '오후', hour12: '12', minute: safeMinute };
  }
  if (safeHour >= 13 && safeHour <= 23) {
    return { ampm: '오후', hour12: String(safeHour - 12).padStart(2, '0'), minute: safeMinute };
  }

  // Edge case: 0~6 시간
  return { ampm: '오전', hour12: '07', minute: safeMinute };
}

function to24Hour(ampm, hour12) {
  const h = Number.parseInt(hour12, 10);
  if (Number.isNaN(h)) return '09';

  if (ampm === '오전') {
    // 오전: 07~11은 그대로
    return String(h).padStart(2, '0');
  }

  // 오후: 12는 그대로, 1~11은 +12
  return h === 12 ? '12' : String(h + 12).padStart(2, '0');
}

export default function ScheduleInput({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddTime,
  onUpdateTime,
  onDeleteTime,
}) {
  const [expandedClassId, setExpandedClassId] = useState(classes[0]?.id || null);
  const [mobilePicker, setMobilePicker] = useState(null);

  const openMobilePicker = (courseId, timeId, field, currentH, currentM) => {
    const picker = toPickerValue(currentH, currentM);
    setMobilePicker({
      courseId,
      timeId,
      field,
      ampm: picker.ampm,
      hour12: picker.hour12,
      minute: picker.minute,
    });
  };

  const closeMobilePicker = () => {
    setMobilePicker(null);
  };

  const applyMobilePicker = () => {
    if (!mobilePicker) return;

    const hour24 = to24Hour(mobilePicker.ampm, mobilePicker.hour12);
    // Keep mobile range aligned with existing behavior: 07:00 ~ 23:55
    const boundedHour = Math.max(7, Math.min(23, Number.parseInt(hour24, 10)));
    const nextHour = String(boundedHour).padStart(2, '0');

    const hourField = mobilePicker.field === 'start' ? 'startH' : 'endH';
    const minuteField = mobilePicker.field === 'start' ? 'startM' : 'endM';

    onUpdateTime(mobilePicker.courseId, mobilePicker.timeId, hourField, nextHour);
    onUpdateTime(mobilePicker.courseId, mobilePicker.timeId, minuteField, mobilePicker.minute);
    closeMobilePicker();
  };

  return (
    <>
      <div className="card schedule-input-pc">
        <h3>2. 수업 정보 입력</h3>
        <div className="name-break-hint">강의명/강의실은 띄어쓰기를 넣으면 줄바꿈되며 최대 2줄까지 표시돼요.</div>

        <div className="schedules-list">
          {classes.map((course) => (
            <div key={course.id} className="course-card">
              <div
                className="course-header"
                onClick={() =>
                  setExpandedClassId(expandedClassId === course.id ? null : course.id)
                }
              >
                <div className="course-header-content">
                  <div className="course-names">
                    <input
                      className="course-name-input"
                      type="text"
                      placeholder="과목명"
                      value={course.name}
                      onChange={(e) => onUpdateClass(course.id, 'name', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="separator">|</span>
                    <input
                      className="course-room-input"
                      type="text"
                      placeholder="강의실"
                      value={course.room}
                      onChange={(e) => onUpdateClass(course.id, 'room', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="course-actions">
                  <span className="expand-icon">
                    {expandedClassId === course.id ? '▲' : '▼'}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClass(course.id);
                    }}
                    title="과목 삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedClassId === course.id && (
                <div className="course-times">
                  {course.times.map((time) => (
                    <div key={time.id} className="time-row">
                      <select
                        className="day-select"
                        value={time.day}
                        onChange={(e) =>
                          onUpdateTime(course.id, time.id, 'day', e.target.value)
                        }
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>

                      <span className="time-separator">|</span>

                      <div className="time-inputs">
                        {/* 모바일: 커스텀 picker 버튼 */}
                        <button
                          type="button"
                          className="time-input time-input-mobile"
                          onClick={() => openMobilePicker(course.id, time.id, 'start', time.startH, time.startM)}
                        >
                          <span className="time-input-mobile-text">{`${time.startH}:${time.startM}`}</span>
                        </button>
                        <span className="time-dash-mobile"> ~ </span>
                        <button
                          type="button"
                          className="time-input time-input-mobile"
                          onClick={() => openMobilePicker(course.id, time.id, 'end', time.endH, time.endM)}
                        >
                          <span className="time-input-mobile-text">{`${time.endH}:${time.endM}`}</span>
                        </button>

                        {/* 데스크톱: 분리 입력 */}
                        <select
                          className="time-input time-input-desktop"
                          value={time.startH}
                          onChange={(e) =>
                            onUpdateTime(course.id, time.id, 'startH', e.target.value)
                          }
                        >
                          {HOURS.map((hour) => (
                            <option key={`start-h-${hour}`} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="time-separator time-separator-desktop">:</span>
                        <select
                          className="time-input time-input-desktop"
                          value={time.startM}
                          onChange={(e) =>
                            onUpdateTime(course.id, time.id, 'startM', e.target.value)
                          }
                        >
                          {MINUTES.map((minute) => (
                            <option key={`start-m-${minute}`} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>

                        <span className="time-dash time-dash-desktop"> - </span>

                        <select
                          className="time-input time-input-desktop"
                          value={time.endH}
                          onChange={(e) =>
                            onUpdateTime(course.id, time.id, 'endH', e.target.value)
                          }
                        >
                          {HOURS.map((hour) => (
                            <option key={`end-h-${hour}`} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="time-separator time-separator-desktop">:</span>
                        <select
                          className="time-input time-input-desktop"
                          value={time.endM}
                          onChange={(e) =>
                            onUpdateTime(course.id, time.id, 'endM', e.target.value)
                          }
                        >
                          {MINUTES.map((minute) => (
                            <option key={`end-m-${minute}`} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        className="delete-time-btn"
                        onClick={() => onDeleteTime(course.id, time.id)}
                        title="시간 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    className="add-time-btn"
                    onClick={() => onAddTime(course.id)}
                  >
                    + 시간 추가
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="add-course-btn" onClick={onAddClass}>
          + 과목 추가
        </button>
      </div>

      {mobilePicker && (
        <div className="mobile-time-picker-backdrop" onClick={closeMobilePicker}>
          <div className="mobile-time-picker-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-time-picker-header">
              <button type="button" className="mobile-time-picker-cancel" onClick={closeMobilePicker}>
                취소
              </button>
              <button type="button" className="mobile-time-picker-done" onClick={applyMobilePicker}>
                완료
              </button>
            </div>
            <div className="mobile-time-picker-columns">
              <div className="mobile-time-picker-column" role="listbox" aria-label="오전 오후">
                {AMPM_OPTIONS.map((ampm) => (
                  <button
                    key={ampm}
                    type="button"
                    className={`mobile-time-picker-option ${mobilePicker.ampm === ampm ? 'active' : ''}`}
                    onClick={() => setMobilePicker((prev) => ({ ...prev, ampm }))}
                  >
                    {ampm}
                  </button>
                ))}
              </div>
              <div className="mobile-time-picker-column" role="listbox" aria-label="시간">
                {(mobilePicker.ampm === '오전' ? HOUR_12_OPTIONS_AM : HOUR_12_OPTIONS_PM).map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={`mobile-time-picker-option ${mobilePicker.hour12 === hour ? 'active' : ''}`}
                    onClick={() => {
                      let newAmpm = mobilePicker.ampm;
                      // 오전 11에서 오후로, 오후 12에서 오전으로 자동 전환
                      if (mobilePicker.ampm === '오전' && mobilePicker.hour12 === '11' && hour === '12') {
                        newAmpm = '오후';
                      } else if (mobilePicker.ampm === '오후' && mobilePicker.hour12 === '12' && hour === '11') {
                        newAmpm = '오전';
                      }
                      setMobilePicker((prev) => ({ ...prev, hour12: hour, ampm: newAmpm }));
                    }}
                  >
                    {hour}
                  </button>
                ))}
              </div>
              <div className="mobile-time-picker-column" role="listbox" aria-label="분">
                {MINUTES.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    className={`mobile-time-picker-option ${mobilePicker.minute === minute ? 'active' : ''}`}
                    onClick={() => setMobilePicker((prev) => ({ ...prev, minute }))}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
