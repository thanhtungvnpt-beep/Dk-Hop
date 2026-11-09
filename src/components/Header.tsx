import React, { useState } from 'react';
import {
  Calendar,
  Bell,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  User as UserIcon,
  Shield,
  Layers,
  LogOut,
  Building
} from 'lucide-react';
import { User, AppNotification } from '../types';

interface HeaderProps {
  currentUser: User | null;
  users: User[];
  notifications: AppNotification[];
  onSwitchUser: (userId: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  notifications,
  onSwitchUser,
  onMarkNotificationRead,
  onNavigate,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="relative z-30 bg-[#091329]/95 backdrop-blur-md border-b border-[#172646] px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo & Subtitle */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/30">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold tracking-wide text-base lg:text-lg">
                MEETING ROOM BOOKING
              </span>
              <span className="text-amber-400 font-extrabold text-base lg:text-lg bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Đăng ký và quản lý phòng họp dùng chung
            </p>
          </div>
        </div>

        {/* Right Actions: Room badge, Notifications, User Selector */}
        <div className="flex items-center gap-3">
          {/* Room Identification Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0d1c3a] border border-[#1e345e] text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-inner">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>01 Phòng họp (Room A)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-xl bg-[#0d1c3a] border border-[#1e345e] text-slate-300 hover:text-white hover:bg-[#142852] transition-colors"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-red-900/50">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c1833] border border-[#1e3563] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-[#18294e] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-sm text-white">Thông báo hệ thống</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                      {unreadCount} chưa đọc
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#152549]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Không có thông báo mới nào
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 hover:bg-[#102044] transition-colors cursor-pointer text-xs ${
                          n.is_read ? 'opacity-70' : 'bg-blue-950/20 font-medium'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'BOOKING_CONFIRMED' || n.type === 'OVERRIDE_APPROVED' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : n.type === 'CONFLICT_DETECTED' || n.type === 'ADMIN_APPROVAL_REQUIRED' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{n.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {n.created_at}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2.5 bg-[#0d1c3a] border border-[#1e345e] hover:border-blue-500/50 px-3 py-1.5 rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser?.name || 'Tài khoản'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: currentUser?.group_color || '#3b82f6' }}
                  ></span>
                  <span>{currentUser?.group_name}</span>
                  <span className="text-amber-400 font-bold ml-0.5">
                    ({currentUser?.default_priority})
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Switch User Dropdown (Role Testing) */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c1833] border border-[#1e3563] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-[#081226] border-b border-[#17274b]">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Đang đăng nhập
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                      <p className="text-[11px] text-slate-400">{currentUser?.email}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        currentUser?.default_priority === 'P1'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : currentUser?.default_priority === 'P2'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {currentUser?.default_priority}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>Vai trò: <strong className="text-slate-200">{currentUser?.role}</strong></span>
                  </div>
                </div>

                <div className="p-2 border-b border-[#17274b]">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Chuyển đổi người dùng (Kiểm thử vai trò & cấp độ):
                  </div>
                  <div className="space-y-1 mt-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-600/30 text-white font-semibold border border-blue-500/40'
                              : 'text-slate-300 hover:bg-[#122347]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: u.group_color || '#3b82f6' }}
                            ></span>
                            <span className="truncate">{u.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-400">{u.group_code}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                u.default_priority === 'P1'
                                  ? 'bg-red-500/20 text-red-400'
                                  : u.default_priority === 'P2'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {u.default_priority}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-cyan-400 hover:bg-cyan-950/30 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Mở Bảng Quản trị & Phê duyệt Xung đột</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
