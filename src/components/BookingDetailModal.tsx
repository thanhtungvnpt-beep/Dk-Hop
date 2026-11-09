import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Award,
  Building,
  AlertTriangle,
  CheckCircle,
  FileText,
  User as UserIcon,
  Trash2,
  History
} from 'lucide-react';
import { Booking, AuditLog, User } from '../types';
import { api } from '../api';

interface BookingDetailModalProps {
  booking: Booking | null;
  currentUser: User | null;
  onClose: () => void;
  onBookingCancelled: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  currentUser,
  onClose,
  onBookingCancelled,
}) => {
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (booking?.id) {
      setLoadingHistory(true);
      api
        .getBookingDetails(booking.id)
        .then((res) => {
          setHistory(res.history || []);
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [booking?.id]);

  if (!booking) return null;

  const canCancel =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    booking.user_id === currentUser?.id ||
    (currentUser?.role === 'GROUP_LEADER' && currentUser.group_id === booking.group_id);

  const handleCancelBooking = async () => {
    setCancelling(true);
    setErrorMsg('');
    try {
      await api.cancelBooking(booking.id, cancelReason || 'Người dùng hủy');
      onBookingCancelled();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi hủy cuộc họp');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold text-xs">
            Đã xác nhận
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold text-xs">
            Xung đột ưu tiên (Chờ duyệt)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-bold text-xs">
            Đã hủy
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2.5 py-1 rounded-lg font-bold text-xs">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg font-bold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0b1733] border border-[#1d325e] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#091226] border-b border-[#18294e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 rounded-xl text-white font-black text-sm flex items-center justify-center shadow ${
                booking.priority === 'P1'
                  ? 'bg-red-600'
                  : booking.priority === 'P2'
                  ? 'bg-amber-600'
                  : 'bg-blue-600'
              }`}
            >
              {booking.priority}
            </span>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Chi tiết cuộc họp
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {booking.group_name} &bull; Mã: {booking.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#122349] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status & Subject banner */}
          <div className="flex items-center justify-between pb-3 border-b border-[#16274b]">
            <h4 className="text-base font-bold text-white">{booking.subject}</h4>
            {getStatusBadge(booking.status)}
          </div>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#071024] p-3 rounded-xl border border-[#16274b] space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Ngày & Giờ họp
              </span>
              <p className="text-white font-semibold text-sm">
                {booking.date} &bull; {booking.start_time} – {booking.end_time}
              </p>
              <p className="text-[11px] text-slate-400">
                Thời lượng: {booking.duration_mins} phút
              </p>
            </div>

            <div className="bg-[#071024] p-3 rounded-xl border border-[#16274b] space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                Địa điểm
              </span>
              <p className="text-white font-semibold text-sm">Room A</p>
              <p className="text-[11px] text-slate-400">Tầng 3 - Tòa nhà Điều hành</p>
            </div>

            <div className="bg-[#071024] p-3 rounded-xl border border-[#16274b] space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Số người tham dự
              </span>
              <p className="text-white font-semibold text-sm">
                {booking.participants_count} thành viên
              </p>
              <p className="text-[11px] text-slate-400">Sức chứa tối đa: 16 người</p>
            </div>

            <div className="bg-[#071024] p-3 rounded-xl border border-[#16274b] space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                Người chủ trì
              </span>
              <p className="text-white font-semibold text-sm">
                {booking.organizer_name || 'Thành viên'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {booking.organizer_email}
              </p>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-[#071024] p-3 rounded-xl border border-[#16274b]">
              <span className="text-slate-400 font-medium block mb-1">Ghi chú:</span>
              <p className="text-slate-200">{booking.notes}</p>
            </div>
          )}

          {/* Audit History Timeline */}
          <div>
            <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Nhật ký lịch sử thao tác:</span>
            </div>
            <div className="bg-[#071024] p-3 rounded-xl border border-[#16274b] max-h-36 overflow-y-auto space-y-2">
              {loadingHistory ? (
                <div className="text-slate-400 italic">Đang tải lịch sử...</div>
              ) : history.length === 0 ? (
                <div className="text-slate-500">Chưa có bản ghi lịch sử bổ sung.</div>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="text-[11px] border-b border-[#142345] pb-1.5 last:border-none">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-cyan-300">{h.action}</span>
                      <span className="font-mono">{h.created_at}</span>
                    </div>
                    <div className="text-slate-200 mt-0.5">{h.reason || 'Không có ghi chú'}</div>
                    <div className="text-[10px] text-slate-500">Thực hiện bởi: {h.performed_by_name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cancel Section */}
          {canCancel && booking.status === 'CONFIRMED' && (
            <div className="pt-2 border-t border-[#16274b]">
              {!showCancelPrompt ? (
                <button
                  onClick={() => setShowCancelPrompt(true)}
                  className="w-full py-2 px-4 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/30 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hủy cuộc họp này</span>
                </button>
              ) : (
                <div className="space-y-3 bg-red-950/20 p-3.5 rounded-xl border border-red-500/40">
                  <div className="text-red-300 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Xác nhận hủy cuộc họp</span>
                  </div>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy cuộc họp..."
                    className="w-full bg-[#071024] border border-[#192b52] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-red-500 text-xs"
                  />
                  {errorMsg && <p className="text-red-400 text-[11px]">{errorMsg}</p>}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {cancelling ? 'Đang hủy...' : 'Đồng ý hủy'}
                    </button>
                    <button
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
