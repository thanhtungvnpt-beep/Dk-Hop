import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';
import { Booking, User } from '../types';

interface MyBookingsViewProps {
  currentUser: User | null;
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNavigate: (tab: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  currentUser,
  bookings,
  onSelectBooking,
  onNavigate,
  onCancelBooking,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter bookings for current user (or group if group leader)
  const myBookings = bookings.filter((b) => {
    const isOwner = b.user_id === currentUser?.id;
    const isGroupLeader =
      currentUser?.role === 'GROUP_LEADER' && b.group_id === currentUser?.group_id;
    const isAdmin =
      currentUser?.role === 'ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';

    // Show if owner, or if group leader of same group, or admin
    const relevant = isOwner || isGroupLeader || isAdmin;
    if (!relevant) return false;

    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-xs font-bold">
            Đã xác nhận
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-lg text-xs font-bold">
            Chờ Admin phê duyệt xung đột
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg text-xs font-bold">
            Đã hủy
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-lg text-xs font-bold">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Lịch của tôi</h2>
            <p className="text-xs text-slate-400">
              Quản lý các cuộc họp do bạn hoặc nhóm của bạn ({currentUser?.group_name}) khởi tạo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#071024] border border-[#18294e] rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b1733]">
                Tất cả trạng thái
              </option>
              <option value="CONFIRMED" className="bg-[#0b1733]">
                Đã xác nhận
              </option>
              <option value="CONFLICT" className="bg-[#0b1733]">
                Chờ phê duyệt xung đột
              </option>
              <option value="CANCELLED" className="bg-[#0b1733]">
                Đã hủy
              </option>
              <option value="REJECTED" className="bg-[#0b1733]">
                Bị từ chối
              </option>
            </select>
          </div>

          <button
            onClick={() => onNavigate('booking')}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng ký mới</span>
          </button>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl shadow-xl overflow-hidden">
        {myBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-semibold text-sm">
              Bạn chưa có cuộc họp nào phù hợp với bộ lọc
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hãy chọn khung giờ trống trong phòng họp Room A và gửi đăng ký.
            </p>
            <button
              onClick={() => onNavigate('booking')}
              className="mt-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng ký phòng họp ngay</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071024] border-b border-[#16274b] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ưu tiên</th>
                  <th className="py-3 px-4">Chủ đề cuộc họp</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Người đặt</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15254a]">
                {myBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-[#0e1d40] transition-colors cursor-pointer"
                    onClick={() => onSelectBooking(b)}
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow ${
                          b.priority === 'P1'
                            ? 'bg-red-600'
                            : b.priority === 'P2'
                            ? 'bg-amber-600'
                            : 'bg-blue-600'
                        }`}
                      >
                        {b.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="font-bold text-sm text-white">{b.subject}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {b.group_name} &bull; {b.participants_count} người tham dự
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-mono font-medium">
                        {b.date}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.start_time} – {b.end_time} ({b.duration_mins}p)
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{b.organizer_name}</div>
                      <div className="text-[10px] text-slate-500">{b.organizer_email}</div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectBooking(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-[#152852] transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onCancelBooking(b.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Hủy cuộc họp"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
