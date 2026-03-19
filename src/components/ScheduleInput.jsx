import React from 'react';
import { DAYS, HOURS, MINUTES } from '../lib/utils';

export default function ScheduleInput({ classes, onAddClass, onUpdateClass, onDeleteClass }) {
  return (
    <div className="card">
      <h3>2. 수업 정보 입력</h3>
      <div className="row header-row">
        <div>요일</div>
        <div>강의명</div>
        <div>시간</div>
        <div>강의실</div>
        <div></div>
      </div>
      
      <div id="schedules-container">
        {classes.map((course) => (
          <div key={course.id} className="row">
            <select
              className="day-select"
              value={course.day}
              onChange={(e) => onUpdateClass(course.id, 'day', e.target.value)}
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            
            <input
              className="name-input"
              type="text"
              placeholder="강의명"
              value={course.name}
              onChange={(e) => onUpdateClass(course.id, 'name', e.target.value)}
            />
            
            <div className="time-inputs">
              <select
                className="start-h"
                value={course.startH}
                onChange={(e) => onUpdateClass(course.id, 'startH', e.target.value)}
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <select
                className="start-m"
                value={course.startM}
                onChange={(e) => onUpdateClass(course.id, 'startM', e.target.value)}
              >
                {MINUTES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <span>~</span>
              <select
                className="end-h"
                value={course.endH}
                onChange={(e) => onUpdateClass(course.id, 'endH', e.target.value)}
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <select
                className="end-m"
                value={course.endM}
                onChange={(e) => onUpdateClass(course.id, 'endM', e.target.value)}
              >
                {MINUTES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            
            <input
              className="room-input"
              type="text"
              placeholder="강의실"
              value={course.room}
              onChange={(e) => onUpdateClass(course.id, 'room', e.target.value)}
            />
            
            <button
              className="delete-btn"
              onClick={() => onDeleteClass(course.id)}
              title="삭제"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
      
      <button className="add-btn" onClick={onAddClass}>+ 수업 추가</button>
    </div>
  );
}
