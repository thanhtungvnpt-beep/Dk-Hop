import React from 'react';
import {
  Home,
  CalendarPlus,
  CalendarDays,
  UserCheck,
  Settings,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingConflictsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingConflictsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'booking',
      label: 'Đăng ký phòng họp',
      icon: CalendarPlus,
    },
    {
      id: 'calendar',
      label: 'Lịch phòng họp',
      icon: CalendarDays,
    },
    {
      id: 'my-bookings',
      label: 'Lịch của tôi',
      icon: UserCheck,
    },
    {
      id: 'admin',
      label: 'Quản trị hệ thống',
      icon: Settings,
      badge: pendingConflictsCount > 0 ? pendingConflictsCount : undefined,
    },
  ];

  return (
    <aside className="w-64 bg-[#091226] border-r border-[#172646] flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation list */}
      <div className="p-3.5 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#111e3b]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  }`}
                  title={`${item.badge} xung đột cần duyệt`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conference Room Preview Image Card (Matches bottom-left of screenshot) */}
      <div className="p-3.5">
        <div className="relative rounded-2xl overflow-hidden border border-[#1d335c] group shadow-xl">
          <div className="h-40 w-full relative">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
              alt="Room A Executive Suite"
              className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#091226] via-[#091226]/50 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-3">
            <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phòng họp tiêu chuẩn VIP</span>
            </div>
            <p className="text-white text-xs font-semibold mt-0.5">Room A (16 Chỗ ngồi)</p>
            <p className="text-slate-400 text-[10px]">Màn hình tương tác 85" & Video Conf</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
