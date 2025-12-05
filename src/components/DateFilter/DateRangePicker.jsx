import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.locale('vi');

function DateRangePicker({ onChange }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({
    start: dayjs().startOf('day'),
    end: dayjs().endOf('day'),
  });
  const [preset, setPreset] = useState('Hôm nay');
  const [leftMonth, setLeftMonth] = useState(dayjs());
  const [rightMonth, setRightMonth] = useState(dayjs());

  // State riêng cho 2 ô input
  const [inputStart, setInputStart] = useState(''); // hiển thị
  const [inputEnd, setInputEnd] = useState('');     // hiển thị

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== PRESETS ====================
  const presets = {
    'Hôm nay': () => ({ start: dayjs().startOf('day'), end: dayjs().endOf('day'), label: 'Hôm nay' }),
    'Hôm qua': () => ({ start: dayjs().subtract(1, 'day').startOf('day'), end: dayjs().subtract(1, 'day').endOf('day'), label: 'Hôm qua' }),
    'Tuần này': () => ({ start: dayjs().startOf('isoWeek'), end: dayjs().endOf('isoWeek'), label: 'Tuần này' }),
    'Tuần trước': () => ({ start: dayjs().subtract(1, 'week').startOf('isoWeek'), end: dayjs().subtract(1, 'week').endOf('isoWeek'), label: 'Tuần trước' }),
    'Tháng này': () => ({ start: dayjs().startOf('month'), end: dayjs().endOf('month'), label: 'Tháng này' }),
    'Tháng trước': () => ({ start: dayjs().subtract(1, 'month').startOf('month'), end: dayjs().subtract(1, 'month').endOf('month'), label: 'Tháng trước' }),
  };

  const applyPreset = (key) => {
    const { start, end, label } = presets[key]();
    updateRange(start, end, label);
    setOpen(false);
  };

  // ==================== CẬP NHẬT RANGE + INPUT ====================
  const updateRange = (start, end, newPreset = '') => {
    setRange({ start, end });
    setPreset(newPreset);
    setInputStart(start.format('DD/MM/YYYY'));
    setInputEnd(end.format('DD/MM/YYYY'));
    setLeftMonth(start);
    setRightMonth(end);
  };

  const emitValue = () => {
    onChange?.({
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
    });
  };

  // Xử lý khi người dùng gõ vào ô input
  const handleInputChange = (type, value) => {
    // Chỉ cho phép số và dấu /
    const cleaned = value.replace(/[^\d/]/g, '');
    if (type === 'start') setInputStart(cleaned);
    else setInputEnd(cleaned);

    // Tự động parse nếu đủ 10 ký tự DD/MM/YYYY
    if (cleaned.length === 10) {
      const parsed = dayjs(cleaned, 'DD/MM/YYYY', true);
      if (parsed.isValid()) {
        const newDate = parsed.startOf('day');
        if (type === 'start') {
          setRange({ ...range, start: newDate });
          setLeftMonth(newDate);
          if (newDate.isAfter(range.end)) {
            setRange({ start: newDate, end: newDate.endOf('day') });
            setInputEnd(cleaned);
            setRightMonth(newDate);
          }
        } else {
          setRange({ ...range, end: newDate.endOf('day') });
          setRightMonth(newDate);
          if (newDate.isBefore(range.start)) {
            setRange({ start: newDate.startOf('day'), end: newDate.endOf('day') });
            setInputStart(cleaned);
            setLeftMonth(newDate);
          }
        }
        setPreset('');
      }
    }
  };

  // Nút Xóa ô input
  const clearInput = (type) => {
    if (type === 'start') {
      setInputStart('');
    } else {
      setInputEnd('');
    }
  };

  const displayText =
    inputStart && inputEnd
      ? inputStart === inputEnd
        ? inputStart
        : `${inputStart} - ${inputEnd}`
      : 'Chọn khoảng thời gian';

  return (
    <div className="relative inline-block" ref={popupRef}>
      {/* Nút chính */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-3 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 min-w-[280px] text-sm"
      >
        <span>{displayText}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white border rounded-lg shadow-2xl z-50 w-full min-w-[780px]">
          <div className="flex">
            {/* Preset bên trái */}
            <div className="w-48 border-r bg-gray-50">
              {Object.keys(presets).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition ${
                    preset === presets[key]().label ? 'bg-blue-100 text-blue-700 font-medium' : ''
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Phần chính */}
            <div className="flex-1 p-5">
              {/* 2 ô Từ ngày - Đến ngày (giống hệt ảnh) */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="flex items-center border rounded overflow-hidden">
                  <span className="px-3 text-gray-600 text-sm bg-gray-50">Từ ngày</span>
                  <input
                    type="text"
                    value={inputStart}
                    onChange={(e) => handleInputChange('start', e.target.value)}
                    placeholder="01/12/2025"
                    className="w-32 px-3 py-2 text-sm outline-none"
                    maxLength="10"
                  />
                  {inputStart && (
                    <button
                      type="button"
                      onClick={() => clearInput('start')}
                      className="px-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center border rounded overflow-hidden">
                  <span className="px-3 text-gray-600 text-sm bg-gray-50">Đến ngày</span>
                  <input
                    type="text"
                    value={inputEnd}
                    onChange={(e) => handleInputChange('end', e.target.value)}
                    placeholder="05/12/2025"
                    className="w-32 px-3 py-2 text-sm outline-none"
                    maxLength="10"
                  />
                  {inputEnd && (
                    <button
                      type="button"
                      onClick={() => clearInput('end')}
                      className="px-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* 2 lịch */}
              <div className="flex gap-10 justify-center">
                <CalendarMonth
                  month={leftMonth}
                  onMonthChange={setLeftMonth}
                  value={range.start}
                  onChange={(d) => {
                    updateRange(d.startOf('day'), range.end);
                  }}
                />
                <CalendarMonth
                  month={rightMonth}
                  onMonthChange={setRightMonth}
                  value={range.end}
                  onChange={(d) => {
                    const newEnd = d.endOf('day');
                    if (newEnd.isBefore(range.start)) {
                      updateRange(newEnd, newEnd);
                    } else {
                      updateRange(range.start, newEnd);
                    }
                  }}
                />
              </div>

              {/* Nút Hủy / Áp dụng */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 border rounded text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    emitValue();
                    setOpen(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component lịch (giữ nguyên, chỉ thêm chút style cho đẹp)
function CalendarMonth({ month, onMonthChange, value, onChange }) {
  const today = dayjs();
  const currentMonth = month || dayjs();
  const year = currentMonth.year();
  const monthNum = currentMonth.month();
  const startOfMonth = currentMonth.startOf('month');
  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0=CN → 6=T7

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(new Date(year, monthNum, day));
    const isToday = date.isSame(today, 'day');
    const isSelected = value && date.isSame(value, 'day');

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => onChange(date)}
        className={`w-9 h-9 rounded-full text-sm flex items-center justify-center hover:bg-blue-100 transition
          ${isToday ? 'bg-red-500 text-white font-bold' : ''}
          ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-6 mb-4">
        <button type="button" onClick={() => onMonthChange(currentMonth.subtract(1, 'month'))} className="text-gray-600 hover:text-black text-xl">
          ←
        </button>
        <span className="font-medium text-sm min-w-[120px]">
          Tháng {monthNum + 1} <span className="text-gray-500">{year}</span>
        </span>
        <button type="button" onClick={() => onMonthChange(currentMonth.add(1, 'month'))} className="text-gray-600 hover:text-black text-xl">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-xs text-gray-600 mb-1 font-medium">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}

export default DateRangePicker;