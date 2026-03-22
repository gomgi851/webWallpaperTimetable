import React, { useState } from 'react';
import { DAYS, HOURS, MINUTES } from '../lib/utils';

export default function ScheduleInput({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddTime,
  onUpdateTime,
  onDeleteTime
}) {
  const [expandedClassId, setExpandedClassId] = useState(classes[0]?.id || null);
  const snapMinuteToFive = (minuteText) => {
    const minute = Number.parseInt(minuteText, 10);
    if (Number.isNaN(minute)) return '00';
    const snapped = Math.max(0, Math.min(55, Math.floor(minute / 5) * 5));
    return String(snapped).padStart(2, '0');
  };

  return (
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
                      {/* 모바일: 네이티브 time picker */}
                      <label className="time-input time-input-mobile">
                        <span className="time-input-mobile-text">{`${time.startH}:${time.startM}`}</span>
                        <input
                          type="time"
                          lang="en-GB"
                          className="time-input-mobile-native"
                          value={`${time.startH}:${time.startM}`}
                          min="07:00"
                          max="23:55"
                          step="300"
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(':');
                            if (h) onUpdateTime(course.id, time.id, 'startH', h.padStart(2, '0'));
                            if (typeof m !== 'undefined') {
                              onUpdateTime(course.id, time.id, 'startM', snapMinuteToFive(m));
                            }
                          }}
                        />
                      </label>
                      <span className="time-dash-mobile"> ~ </span>
                      <label className="time-input time-input-mobile">
                        <span className="time-input-mobile-text">{`${time.endH}:${time.endM}`}</span>
                        <input
                          type="time"
                          lang="en-GB"
                          className="time-input-mobile-native"
                          value={`${time.endH}:${time.endM}`}
                          min="07:00"
                          max="23:55"
                          step="300"
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(':');
                            if (h) onUpdateTime(course.id, time.id, 'endH', h.padStart(2, '0'));
                            if (typeof m !== 'undefined') {
                              onUpdateTime(course.id, time.id, 'endM', snapMinuteToFive(m));
                            }
                          }}
                        />
                      </label>

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
  );
}

