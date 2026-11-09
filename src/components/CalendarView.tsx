import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import { Booking, Group } from '../types';

interface CalendarViewProps {
  bookings: Booking[];
  groups: Group[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onQuickBookSlot: (slot: { start: string; end: string }) => void;
  onNavigate: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  groups,
  selectedDate,
  onDateChange,
  onSelectBooking,
  onQuickBookSlot,
  onNavigate,
}) => {
  const [filterGroupId, setFilterGroupId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Daily hours from 08:00 to 17:00
  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Helper date formatter
  const formatDateTitle = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayNames = [
        'Chủ Nhật',
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
      ];
      return `${dayNames[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Date Navigation
  const handlePrev = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - (viewMode === 'day' ? 1 : 7));
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + (viewMode === 'day' ? 1 : 7));
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().slice(0, 10));
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    if (filterGroupId !== 'ALL' && b.group_id !== filterGroupId) return false;
    return true;
  });

  // Calculate week dates when in week mode
  const getWeekDates = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    const day = current.getDay(); // 0 is Sunday
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    const weekDays = [];
    for (let i = 0; i < 6; i++) {
      // Monday to Saturday
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d.toISOString().slice(0, 10));
    }
    return weekDays;
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Lịch phòng họp – Room A</h2>
            <p className="text-xs text-slate-400">
              Xem và điều phối toàn bộ các cuộc họp dùng chung
            </p>
          </div>
        </div>

        {/* View Switcher, Date Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Group Filter */}
          <div className="flex items-center gap-1.5 bg-[#071024] border border-[#18294e] rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterGroupId}
              onChange={(e) => setFilterGroupId(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b1733]">
                Tất cả các nhóm
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#0b1733]">
                  {g.name} ({g.default_priority})
                </option>
              ))}
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#071024] border border-[#18294e] rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Theo tuần
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-[#071024] border border-[#18294e] rounded-xl p-1">
            <button
              onClick={handlePrev}
              className="p-1 hover:text-white text-slate-400 hover:bg-[#122349] rounded transition-colors"
              title="Trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-0.5 text-xs text-slate-300 hover:text-white font-medium"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:text-white text-slate-400 hover:bg-[#122349] rounded transition-colors"
              title="Sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Viewport */}
      {viewMode === 'day' ? (
        /* DAY VIEW */
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#16274b]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{formatDateTitle(selectedDate)}</span>
              <span className="text-xs font-normal text-slate-400">
                (
                {
                  filteredBookings.filter(
                    (b) => b.date === selectedDate && b.status === 'CONFIRMED'
                  ).length
                }{' '}
                cuộc họp đã xác nhận)
              </span>
            </h3>
            <button
              onClick={() => onNavigate('booking')}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng ký mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {hours.map((hour, idx) => {
              const nextHour =
                idx < hours.length - 1
                  ? hours[idx + 1]
                  : `${Number(hour.split(':')[0]) + 1}:00`;

              const meeting = filteredBookings.find(
                (b) =>
                  b.date === selectedDate &&
                  b.status === 'CONFIRMED' &&
                  b.start_time <= hour &&
                  b.end_time > hour
              );

              return (
                <div key={hour} className="flex items-center gap-4 text-xs">
                  <div className="w-16 font-mono text-slate-400 font-semibold shrink-0">
                    {hour}
                  </div>

                  {meeting ? (
                    <div
                      onClick={() => onSelectBooking(meeting)}
                      className={`flex-1 p-3 rounded-xl cursor-pointer shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-between ${
                        meeting.priority === 'P1'
                          ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
                          : meeting.priority === 'P2'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-sky-600 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-black/25 text-white font-black text-xs flex items-center justify-center">
                          {meeting.priority}
                        </span>
                        <div>
                          <div className="font-bold text-sm">
                            {meeting.group_name} &bull; {meeting.subject}
                          </div>
                          <div className="text-[11px] opacity-90 mt-0.5">
                            {meeting.start_time} – {meeting.end_time} &bull; Chủ trì:{' '}
                            {meeting.organizer_name} ({meeting.participants_count} người)
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                        Chi tiết &rarr;
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => onQuickBookSlot({ start: hour, end: nextHour })}
                      className="flex-1 p-3 rounded-xl border border-dashed border-[#1e345e] hover:border-emerald-500/60 bg-[#071024]/50 hover:bg-emerald-950/20 text-slate-500 hover:text-emerald-400 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <span>Trống &bull; Có thể đăng ký phòng</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-400 text-[11px]">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Đặt {hour} - {nextHour}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* WEEK VIEW */
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-5 shadow-xl overflow-x-auto">
          <div className="min-w-[750px]">
            {/* Week Header */}
            <div className="grid grid-cols-7 gap-2 pb-3 border-b border-[#16274b] text-center text-xs">
              <div className="text-slate-400 font-semibold text-left pl-2">Khung giờ</div>
              {weekDates.map((dStr) => {
                const isSelected = dStr === selectedDate;
                const dateObj = new Date(dStr + 'T00:00:00');
                const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dateObj.getDay()];
                return (
                  <div
                    key={dStr}
                    onClick={() => {
                      onDateChange(dStr);
                      setViewMode('day');
                    }}
                    className={`p-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 text-white font-bold border border-blue-500/50'
                        : 'text-slate-300 hover:bg-[#122349]'
                    }`}
                  >
                    <div>{dayName}</div>
                    <div className="text-[11px] text-slate-400">
                      {dateObj.getDate()}/{dateObj.getMonth() + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week Grid Rows */}
            <div className="space-y-2 mt-3">
              {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(
                (hour) => (
                  <div key={hour} className="grid grid-cols-7 gap-2 items-center text-xs">
                    <div className="font-mono text-slate-400 font-medium pl-2">
                      {hour}
                    </div>
                    {weekDates.map((dStr) => {
                      const meeting = filteredBookings.find(
                        (b) =>
                          b.date === dStr &&
                          b.status === 'CONFIRMED' &&
                          b.start_time <= hour &&
                          b.end_time > hour
                      );

                      if (meeting) {
                        return (
                          <div
                            key={dStr}
                            onClick={() => onSelectBooking(meeting)}
                            className={`p-1.5 rounded-lg text-[10px] font-semibold text-white truncate cursor-pointer shadow ${
                              meeting.priority === 'P1'
                                ? 'bg-red-600 hover:bg-red-500'
                                : meeting.priority === 'P2'
                                ? 'bg-amber-600 hover:bg-amber-500'
                                : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                            title={`${meeting.group_name}: ${meeting.subject} (${meeting.start_time}-${meeting.end_time})`}
                          >
                            <span className="font-black mr-1">[{meeting.priority}]</span>
                            {meeting.subject}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={dStr}
                          onClick={() => {
                            onDateChange(dStr);
                            const nextH = `${Number(hour.split(':')[0]) + 1}:00`;
                            onQuickBookSlot({ start: hour, end: nextH });
                          }}
                          className="h-8 rounded-lg border border-dashed border-[#17274b] hover:border-emerald-500/50 hover:bg-emerald-950/20 cursor-pointer flex items-center justify-center text-slate-600 hover:text-emerald-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
