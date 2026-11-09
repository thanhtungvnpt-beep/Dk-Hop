import React, { useState, useEffect } from 'react';
import {
  CalendarPlus,
  Calendar,
  Clock,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { User, Group, Booking, PriorityLevel } from '../types';

interface BookingViewProps {
  currentUser: User | null;
  groups: Group[];
  bookings: Booking[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSubmitBooking: (formData: any) => Promise<any>;
  onNavigate: (tab: string) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  currentUser,
  groups,
  bookings,
  selectedDate,
  onDateChange,
  onSubmitBooking,
  onNavigate,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    currentUser?.group_id || 'grp-management'
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [subject, setSubject] = useState<string>('');
  const [participantsCount, setParticipantsCount] = useState<number>(6);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultAlert, setResultAlert] = useState<{
    type: 'success' | 'conflict' | 'error';
    title: string;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    if (currentUser?.group_id) {
      setSelectedGroupId(currentUser.group_id);
    }
  }, [currentUser?.group_id]);

  // Selected group object
  const targetGroup =
    groups.find((g) => g.id === selectedGroupId) ||
    groups.find((g) => g.id === currentUser?.group_id) ||
    groups[0];

  const derivedPriority: PriorityLevel = targetGroup?.default_priority || 'P3';

  // Duration in minutes
  const getDuration = () => {
    if (!startTime || !endTime) return 0;
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    return eH * 60 + eM - (sH * 60 + sM);
  };

  const durationMins = getDuration();
  const isDurationValid = durationMins > 0 && durationMins <= 60;

  // Live conflict detection preview
  const activeConfirmed = bookings.filter(
    (b) => b.date === selectedDate && b.status === 'CONFIRMED'
  );

  const conflictingBooking = activeConfirmed.find((b) => {
    return startTime < b.end_time && b.start_time < endTime;
  });

  const priorityRanks: Record<string, number> = { P1: 1, P2: 2, P3: 3 };
  const willTriggerAdminConflict =
    conflictingBooking &&
    priorityRanks[derivedPriority] < priorityRanks[conflictingBooking.priority];

  const willBeRejected =
    conflictingBooking &&
    priorityRanks[derivedPriority] >= priorityRanks[conflictingBooking.priority];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDurationValid) return;

    setIsSubmitting(true);
    setResultAlert(null);

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
        setResultAlert({
          type: 'success',
          title: 'Đăng ký thành công',
          message: `Cuộc họp "${subject}" ngày ${selectedDate} (${startTime} – ${endTime}) đã được xác nhận.`,
        });
        setSubject('');
        setNotes('');
      } else if (res.status === 'CONFLICT') {
        setResultAlert({
          type: 'conflict',
          title: 'Phát hiện xung đột ưu tiên (Đã gửi Admin)',
          message: res.message,
          details: res.existingBooking,
        });
      }
    } catch (err: any) {
      setResultAlert({
        type: 'error',
        title: 'Không thể đăng ký phòng',
        message: err.message || 'Lỗi kiểm tra lịch phòng họp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Introduction Banner */}
      <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Đăng ký phòng họp – Room A
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Phòng họp duy nhất &bull; Sức chứa 16 người &bull; Điều phối công bằng theo cơ chế ưu tiên P1 &gt; P2 &gt; P3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold bg-[#071024] px-3 py-1.5 rounded-xl border border-[#18294e]">
              Thời lượng tối đa: <strong className="text-amber-400">60 phút</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Result Alert Box */}
      {resultAlert && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start gap-3 border shadow-xl ${
            resultAlert.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50'
              : resultAlert.type === 'conflict'
              ? 'bg-amber-950/40 text-amber-300 border-amber-500/50'
              : 'bg-red-950/40 text-red-300 border-red-500/50'
          }`}
        >
          {resultAlert.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <div className="font-bold text-sm text-white">{resultAlert.title}</div>
            <div className="leading-relaxed">{resultAlert.message}</div>
            {resultAlert.details && (
              <div className="mt-2 p-2 bg-black/30 rounded-lg text-slate-300">
                Cuộc họp hiện tại: <strong className="text-white">{resultAlert.details.groupName}</strong> ({resultAlert.details.time}) - Cấp {resultAlert.details.priority}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('calendar')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Xem lịch phòng họp &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Nhóm đăng ký */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Nhóm đăng ký <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#0b1733] text-white">
                    {g.name} &bull; Cấp {g.default_priority} ({g.description})
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Cấp ưu tiên tự động gán:</span>
                <span
                  className={`px-2 py-0.5 rounded font-black text-xs text-white ${
                    derivedPriority === 'P1'
                      ? 'bg-red-600'
                      : derivedPriority === 'P2'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {derivedPriority}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({derivedPriority === 'P1' ? 'Ưu tiên cao nhất' : derivedPriority === 'P2' ? 'Ưu tiên cao' : 'Ưu tiên thông thường'})
                </span>
              </div>
            </div>

            {/* Ngày họp */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Ngày họp <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm font-medium"
                required
              />
            </div>

            {/* Giờ bắt đầu & Giờ kết thúc */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Giờ bắt đầu <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    Giờ kết thúc <span className="text-red-400">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      durationMins > 60 || durationMins <= 0
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {durationMins > 0 ? `${durationMins} phút` : 'Không hợp lệ'}
                  </span>
                </div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full bg-[#071024] border rounded-xl px-3.5 py-2.5 text-white focus:outline-none font-mono text-sm ${
                    durationMins > 60 || durationMins <= 0
                      ? 'border-red-500 text-red-200'
                      : 'border-[#192b52] focus:border-blue-500'
                  }`}
                  required
                />
              </div>
            </div>

            {durationMins > 60 && (
              <p className="text-red-400 text-xs flex items-center gap-1.5 bg-red-950/20 p-2 rounded-lg border border-red-500/30">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Quy định công ty: Thời lượng cuộc họp không được vượt quá 60 phút.</span>
              </p>
            )}

            {/* Nội dung cuộc họp */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Nội dung cuộc họp <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề hoặc mục tiêu cuộc họp..."
                className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Số người tham dự */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Số người tham dự
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="w-full bg-[#071024] border border-[#192b52] rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Phòng họp
                </label>
                <div className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3 py-2 text-slate-300 text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Room A (16 Chỗ)</span>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Ghi chú thêm
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Trang thiết bị cần chuẩn bị, tài liệu họp..."
                className="w-full bg-[#071024] border border-[#192b52] rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Live Conflict Warning Box */}
            {conflictingBooking && (
              <div
                className={`p-3.5 rounded-xl border ${
                  willTriggerAdminConflict
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-red-950/30 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {willTriggerAdminConflict
                      ? 'Trùng giờ với cuộc họp có cấp ưu tiên thấp hơn'
                      : 'Trùng giờ phòng họp đã được xác nhận'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Đã có cuộc họp: <strong>{conflictingBooking.group_name}</strong> ({conflictingBooking.start_time} – {conflictingBooking.end_time}) cấp {conflictingBooking.priority}.
                </p>
                <p className="text-[11px] mt-1 font-medium">
                  {willTriggerAdminConflict
                    ? `Vì nhóm của bạn có cấp ưu tiên (${derivedPriority}) cao hơn (${conflictingBooking.priority}), hệ thống sẽ gửi YÊU CẦU ĐIỀU PHỐI XUNG ĐỘT tới Admin để xét duyệt.`
                    : 'Yêu cầu sẽ bị từ chối vì cùng hoặc thấp hơn cấp ưu tiên của người đặt trước. Vui lòng chọn khung giờ trống.'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isDurationValid || willBeRejected}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-700/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
            >
              <CalendarPlus className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Đang kiểm tra lịch...'
                  : willTriggerAdminConflict
                  ? 'Gửi Yêu Cầu Xung Đột Ưu Tiên Tới Admin'
                  : 'Xác Nhận Đăng Ký Phòng Họp'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Info: Priority Table & Day Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Priority Rules Card */}
          <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm pb-2 border-b border-[#16274b]">
              <Award className="w-4 h-4" />
              <span>Quy định Cấp Ưu Tiên (Priority Rules)</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#071024] border border-[#17274b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                    P1
                  </span>
                  <div>
                    <div className="font-bold text-white">Management</div>
                    <div className="text-[10px] text-slate-400">Ban Giám đốc & Điều hành</div>
                  </div>
                </div>
                <span className="text-[11px] text-red-400 font-bold">Cao nhất</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#071024] border border-[#17274b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    P2
                  </span>
                  <div>
                    <div className="font-bold text-white">Outsourcing</div>
                    <div className="text-[10px] text-slate-400">Khối Khách hàng & Đối ngoại</div>
                  </div>
                </div>
                <span className="text-[11px] text-amber-400 font-bold">Cao</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#071024] border border-[#17274b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    P3
                  </span>
                  <div>
                    <div className="font-bold text-white">Production & QC</div>
                    <div className="text-[10px] text-slate-400">Khối Sản xuất & Kiểm chuẩn</div>
                  </div>
                </div>
                <span className="text-[11px] text-blue-400 font-bold">Thông thường</span>
              </div>
            </div>
          </div>

          {/* Today's Schedule Overview */}
          <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#16274b]">
              <span className="text-white font-bold text-sm">Lịch ngày {selectedDate}</span>
              <span className="text-xs text-slate-400">{activeConfirmed.length} cuộc họp</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {activeConfirmed.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">
                  Phòng họp hoàn toàn trống vào ngày này
                </div>
              ) : (
                activeConfirmed.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-[#071024] border border-[#16274b] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-md text-white font-black text-[10px] flex items-center justify-center shrink-0 ${
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
                        <div className="font-semibold text-white truncate">{b.subject}</div>
                        <div className="text-[10px] text-slate-400">{b.group_name}</div>
                      </div>
                    </div>
                    <span className="font-mono text-slate-300 font-bold shrink-0 ml-2">
                      {b.start_time} – {b.end_time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
