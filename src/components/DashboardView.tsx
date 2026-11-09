import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Play,
  CheckCircle2,
  ListFilter,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  Sparkles
} from 'lucide-react';
import {
  User,
  Group,
  Booking,
  DashboardStats,
  PriorityLevel
} from '../types';

interface DashboardViewProps {
  currentUser: User | null;
  groups: Group[];
  stats: DashboardStats | null;
  bookings: Booking[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSubmitBooking: (formData: any) => Promise<any>;
  onSelectBooking: (booking: Booking) => void;
  onQuickBookSlot: (slot: { start: string; end: string }) => void;
  availableSlots: string[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  groups,
  stats,
  bookings,
  selectedDate,
  onDateChange,
  onSubmitBooking,
  onSelectBooking,
  onQuickBookSlot,
  availableSlots,
}) => {
  // Booking Form State
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    currentUser?.group_id || 'grp-production'
  );
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('15:00');
  const [subject, setSubject] = useState<string>(
    'Họp triển khai kế hoạch sản xuất tháng 11'
  );
  const [participantsCount, setParticipantsCount] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'conflict' | 'error';
    text: string;
  } | null>(null);

  // Derive target group and priority
  const currentSelectedGroup =
    groups.find((g) => g.id === selectedGroupId) ||
    groups.find((g) => g.id === currentUser?.group_id) ||
    groups[0];

  const derivedPriority: PriorityLevel =
    currentSelectedGroup?.default_priority || 'P3';

  // Format date display for timeline header e.g. "Thứ Tư, 29/10/2026"
  const formatDateDisplay = (dateStr: string) => {
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
      const dayName = dayNames[d.getDay()];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${dayName}, ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Date Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await onSubmitBooking({
        group_id: selectedGroupId,
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        subject,
        participants_count: participantsCount,
        notes,
      });

      if (res.status === 'CONFIRMED') {
        setSubmitMessage({
          type: 'success',
          text: 'Đăng ký phòng họp thành công! Lịch họp đã được xác nhận.',
        });
      } else if (res.status === 'CONFLICT') {
        setSubmitMessage({
          type: 'conflict',
          text:
            res.message ||
            'Phát hiện xung đột ưu tiên: Đã gửi yêu cầu đến Admin phê duyệt điều phối.',
        });
      }
    } catch (err: any) {
      setSubmitMessage({
        type: 'error',
        text: err.message || 'Lỗi khi gửi đăng ký phòng họp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicking an available time slot card on timeline
  const handleSlotClick = (slotStart: string, slotEnd: string) => {
    setStartTime(slotStart);
    setEndTime(slotEnd);
    onQuickBookSlot({ start: slotStart, end: slotEnd });
  };

  // Working timeline hours
  const timeLabels = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Bookings on selected date that are CONFIRMED
  const confirmedToday = bookings.filter(
    (b) => b.date === selectedDate && b.status === 'CONFIRMED'
  );

  return (
    <div className="space-y-5">
      {/* 1. TOP KPI CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cuộc họp hôm nay */}
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/20">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Cuộc họp hôm nay</div>
            <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {stats?.todayMeetingsCount ?? 4} cuộc
            </div>
          </div>
        </div>

        {/* Card 2: Nhóm sử dụng */}
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/20">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Nhóm sử dụng</div>
            <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              4 nhóm
            </div>
          </div>
        </div>

        {/* Card 3: Thời lượng tối đa */}
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/20">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Thời lượng tối đa</div>
            <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              60 phút
            </div>
          </div>
        </div>

        {/* Card 4: Cơ chế điều phối */}
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/20">
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Cơ chế điều phối</div>
            <div className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Ưu tiên <span className="text-amber-400 text-lg font-bold">(Priority)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CENTER SECTION: Timeline & Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Timeline & Priority Legend (Col 7 / 12) */}
        <div className="lg:col-span-7 bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#16274b]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Lịch phòng họp – Room A (Hôm nay)
                </h2>
              </div>

              {/* Date navigator */}
              <div className="flex items-center gap-1.5 bg-[#071024] border border-[#192b52] rounded-xl px-2 py-1 shadow-inner">
                <button
                  onClick={handlePrevDay}
                  className="p-1 hover:text-white text-slate-400 hover:bg-[#122349] rounded transition-colors"
                  title="Ngày trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-white">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{formatDateDisplay(selectedDate)}</span>
                </div>
                <button
                  onClick={handleNextDay}
                  className="p-1 hover:text-white text-slate-400 hover:bg-[#122349] rounded transition-colors"
                  title="Ngày sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split layout: Timeline Grid + Priority Legend */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
              {/* Timeline (8 cols on md) */}
              <div className="md:col-span-8 space-y-2.5">
                {/* 08:00 */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-400 pt-2 shrink-0">
                    08:00
                  </span>
                  {(() => {
                    const b = confirmedToday.find((m) => m.start_time === '08:00');
                    if (b) {
                      return (
                        <div
                          onClick={() => onSelectBooking(b)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {b.group_name} – {b.subject}
                            </div>
                            <div className="text-[11px] text-red-100 font-medium">
                              {b.start_time} – {b.end_time} ({b.duration_mins} phút)
                            </div>
                          </div>
                          <span className="bg-red-800/80 border border-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
                            {b.priority}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        onClick={() => handleSlotClick('08:00', '09:00')}
                        className="flex-1 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Trống – Có thể đăng ký</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 09:00 */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-400 pt-2 shrink-0">
                    09:00
                  </span>
                  {(() => {
                    const b = confirmedToday.find((m) => m.start_time === '09:00');
                    if (b) {
                      return (
                        <div
                          onClick={() => onSelectBooking(b)}
                          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {b.group_name} – {b.subject}
                            </div>
                            <div className="text-[11px] text-amber-100 font-medium">
                              {b.start_time} – {b.end_time} ({b.duration_mins} phút)
                            </div>
                          </div>
                          <span className="bg-amber-800/80 border border-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
                            {b.priority}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        onClick={() => handleSlotClick('09:00', '10:00')}
                        className="flex-1 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Trống – Có thể đăng ký</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 10:00 */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-400 pt-2 shrink-0">
                    10:00
                  </span>
                  {(() => {
                    const b = confirmedToday.find((m) => m.start_time === '10:00');
                    if (b) {
                      return (
                        <div
                          onClick={() => onSelectBooking(b)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {b.group_name} – {b.subject}
                            </div>
                            <div className="text-[11px] text-blue-100 font-medium">
                              {b.start_time} – {b.end_time} ({b.duration_mins} phút)
                            </div>
                          </div>
                          <span className="bg-blue-800/80 border border-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
                            {b.priority}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        onClick={() => handleSlotClick('10:00', '11:00')}
                        className="flex-1 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Trống – Có thể đăng ký</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 11:00 axis mark */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-500 pt-1 shrink-0">
                    11:00
                  </span>
                  <div className="flex-1 border-t border-dashed border-[#182a4d] my-2"></div>
                </div>

                {/* 13:00 */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-400 pt-2 shrink-0">
                    13:00
                  </span>
                  {(() => {
                    const b = confirmedToday.find((m) => m.start_time === '13:00');
                    if (b) {
                      return (
                        <div
                          onClick={() => onSelectBooking(b)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {b.group_name} – {b.subject}
                            </div>
                            <div className="text-[11px] text-blue-100 font-medium">
                              {b.start_time} – {b.end_time} ({b.duration_mins} phút)
                            </div>
                          </div>
                          <span className="bg-blue-800/80 border border-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
                            {b.priority}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        onClick={() => handleSlotClick('13:00', '14:00')}
                        className="flex-1 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Trống – Có thể đăng ký</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 14:00 */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-400 pt-2 shrink-0">
                    14:00
                  </span>
                  {(() => {
                    const b = confirmedToday.find((m) => m.start_time === '14:00');
                    if (b) {
                      return (
                        <div
                          onClick={() => onSelectBooking(b)}
                          className={`flex-1 ${
                            b.priority === 'P1'
                              ? 'bg-gradient-to-r from-red-600 to-rose-700'
                              : b.priority === 'P2'
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                              : 'bg-gradient-to-r from-blue-600 to-sky-600'
                          } text-white rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all`}
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {b.group_name} – {b.subject}
                            </div>
                            <div className="text-[11px] text-blue-100 font-medium">
                              {b.start_time} – {b.end_time} ({b.duration_mins} phút)
                            </div>
                          </div>
                          <span className="bg-black/30 border border-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
                            {b.priority}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        onClick={() => handleSlotClick('14:00', '15:00')}
                        className="flex-1 border-2 border-dashed border-emerald-500/60 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">Trống – Có thể đăng ký</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 15:00 */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-400 pt-2 shrink-0">
                    15:00
                  </span>
                  {(() => {
                    const b = confirmedToday.find((m) => m.start_time === '15:00');
                    if (b) {
                      return (
                        <div
                          onClick={() => onSelectBooking(b)}
                          className={`flex-1 ${
                            b.priority === 'P1'
                              ? 'bg-gradient-to-r from-red-600 to-rose-700'
                              : b.priority === 'P2'
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                              : 'bg-gradient-to-r from-blue-600 to-sky-600'
                          } text-white rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all`}
                        >
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {b.group_name} – {b.subject}
                            </div>
                            <div className="text-[11px] text-blue-100 font-medium">
                              {b.start_time} – {b.end_time} ({b.duration_mins} phút)
                            </div>
                          </div>
                          <span className="bg-black/30 border border-white/20 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
                            {b.priority}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        onClick={() => handleSlotClick('15:00', '16:00')}
                        className="flex-1 border-2 border-dashed border-emerald-500/60 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">Trống – Có thể đăng ký</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 16:00 & 17:00 axis marks */}
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-500 pt-1 shrink-0">
                    16:00
                  </span>
                  <div className="flex-1 border-t border-dashed border-[#182a4d] my-2"></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-12 text-xs font-mono text-slate-500 pt-1 shrink-0">
                    17:00
                  </span>
                  <div className="flex-1 border-t border-dashed border-[#182a4d] my-2"></div>
                </div>
              </div>

              {/* Priority Legend (4 cols on md) */}
              <div className="md:col-span-4 bg-[#081226]/80 border border-[#17274b] rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-[#152445] text-amber-400 text-xs font-bold">
                    <Award className="w-4 h-4" />
                    <span>Cấp ưu tiên (Priority)</span>
                  </div>

                  <div className="space-y-3 mt-3">
                    {/* P1 */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow">
                        P1
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">Management</div>
                        <div className="text-[10px] text-slate-400">Ưu tiên cao nhất</div>
                      </div>
                    </div>

                    {/* P2 */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow">
                        P2
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">Outsourcing</div>
                        <div className="text-[10px] text-slate-400">Ưu tiên cao</div>
                      </div>
                    </div>

                    {/* P3 - Production */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow">
                        P3
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">Production</div>
                        <div className="text-[10px] text-slate-400">Ưu tiên thông thường</div>
                      </div>
                    </div>

                    {/* P3 - QC */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow">
                        P3
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">Quality Control (QC)</div>
                        <div className="text-[10px] text-slate-400">Ưu tiên thông thường</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/30 text-[10px] text-slate-400 leading-relaxed">
                  <span className="text-cyan-400 font-bold block mb-0.5">Quy tắc điều phối:</span>
                  P1 &gt; P2 &gt; P3. Khi có yêu cầu ưu tiên cao hơn trùng giờ, hệ thống kích hoạt cơ chế duyệt giải quyết xung đột qua Quản trị viên.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Đăng ký phòng họp (Booking Form) (Col 5 / 12) */}
        <div className="lg:col-span-5 bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-[#16274b]">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Đăng ký phòng họp
              </h2>
            </div>

            {/* Notification banner */}
            {submitMessage && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  submitMessage.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                    : submitMessage.type === 'conflict'
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/40'
                    : 'bg-red-950/40 text-red-300 border border-red-500/40'
                }`}
              >
                {submitMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed">{submitMessage.text}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Nhóm đăng ký * */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nhóm đăng ký <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#0b1733] text-white">
                      {g.name} ({g.default_priority})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày họp * */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ngày họp <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Giờ bắt đầu * & Giờ kết thúc * */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giờ bắt đầu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">
                      Giờ kết thúc <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">(Tối đa 60 phút)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Nội dung cuộc họp * */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nội dung cuộc họp <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Nhập chủ đề hoặc nội dung cuộc họp..."
                  className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Số người tham dự */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Số người tham dự
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="w-full bg-[#071024] border border-[#192b52] rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Cấp ưu tiên */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cấp ưu tiên
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg font-black text-xs text-white shadow ${
                      derivedPriority === 'P1'
                        ? 'bg-red-600'
                        : derivedPriority === 'P2'
                        ? 'bg-amber-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {derivedPriority}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    (Theo nhóm)
                  </span>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="(Không bắt buộc)"
                  className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-700/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM THREE PANELS (PANEL A, PANEL B, PANEL C) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Panel A: Cuộc họp tiếp theo (Col 4) */}
        <div className="md:col-span-4 bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold pb-3 border-b border-[#16274b]">
            <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            <span>Cuộc họp tiếp theo</span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
              {stats?.nextMeeting?.priority || 'P2'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">
                {stats?.nextMeeting?.group_name || 'Outsourcing'}
              </div>
              <div className="text-xs text-slate-300 truncate">
                {stats?.nextMeeting?.subject || 'Họp kế hoạch sản xuất'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {stats?.nextMeeting
                    ? `${stats.nextMeeting.start_time} – ${stats.nextMeeting.end_time}`
                    : '09:00 – 10:00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel B: Khung giờ còn trống hôm nay (Col 3) */}
        <div className="md:col-span-3 bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold pb-3 border-b border-[#16274b]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Khung giờ còn trống hôm nay</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {availableSlots.length > 0 ? (
              availableSlots.slice(0, 4).map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const [s, e] = slot.split(' – ');
                    handleSlotClick(s, e);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-emerald-500/60 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                  title="Nhấn để điền vào biểu mẫu đăng ký"
                >
                  {slot}
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                Hôm nay đã kín lịch họp
              </span>
            )}
          </div>
        </div>

        {/* Panel C: Đăng ký gần đây (Col 5) */}
        <div className="md:col-span-5 bg-[#0b1733] border border-[#18294e] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold pb-3 border-b border-[#16274b]">
            <ListFilter className="w-4 h-4" />
            <span>Đăng ký gần đây</span>
          </div>

          <div className="mt-3 space-y-2">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              stats.recentBookings.slice(0, 2).map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b)}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#071024] border border-[#17274b] hover:border-blue-500/30 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shrink-0 ${
                        b.priority === 'P1'
                          ? 'bg-red-600'
                          : b.priority === 'P2'
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {b.priority}
                    </span>
                    <div className="truncate">
                      <span className="font-semibold text-white">
                        {b.group_name} – {b.subject}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {b.date.slice(5)} {b.start_time} – {b.end_time}
                    </span>
                    <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      Đã xác nhận
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-2">
                Chưa có cuộc họp mới nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
