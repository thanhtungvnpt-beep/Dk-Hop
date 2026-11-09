import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BookingView } from './components/BookingView';
import { CalendarView } from './components/CalendarView';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminView } from './components/AdminView';
import { BookingDetailModal } from './components/BookingDetailModal';
import {
  User,
  Group,
  Booking,
  DashboardStats,
  AppNotification
} from './types';
import { api } from './api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-29');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all primary state from backend
  const loadInitialData = useCallback(async () => {
    try {
      const [me, allUsers, allGroups, allBookings, statData, slots, notifs] =
        await Promise.all([
          api.getMe(),
          api.getUsers(),
          api.getGroups(),
          api.getBookings({ date: selectedDate }),
          api.getStats(selectedDate),
          api.getAvailableSlots(selectedDate),
          api.getNotifications(),
        ]);

      setCurrentUser(me);
      setUsers(allUsers);
      setGroups(allGroups);
      setBookings(allBookings);
      setStats(statData);
      setAvailableSlots(slots);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Refresh bookings and stats when selected date changes
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    try {
      const [newBookings, newStats, slots] = await Promise.all([
        api.getBookings({ date: newDate }),
        api.getStats(newDate),
        api.getAvailableSlots(newDate),
      ]);
      setBookings(newBookings);
      setStats(newStats);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error refreshing date data:', err);
    }
  };

  // Switch demo user to test different roles and priorities
  const handleSwitchUser = async (userId: string) => {
    try {
      await api.switchUser(userId);
      const [me, notifs] = await Promise.all([
        api.getMe(),
        api.getNotifications(),
      ]);
      setCurrentUser(me);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Submit booking
  const handleSubmitBooking = async (formData: any) => {
    const res = await api.createBooking(formData);
    // Reload bookings and stats
    await handleDateChange(selectedDate);
    const notifs = await api.getNotifications();
    setNotifications(notifs);
    return res;
  };

  // Handle quick click on available slot
  const handleQuickBookSlot = (slot: { start: string; end: string }) => {
    // If we're not on dashboard or booking, switch to booking
    // Form is also directly embedded on dashboard!
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#070d1d] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-semibold text-slate-300">
          Đang khởi tạo hệ thống Meeting Room Booking Pro...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1d] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        users={users}
        notifications={notifications}
        onSwitchUser={handleSwitchUser}
        onMarkNotificationRead={handleMarkNotificationRead}
        onNavigate={setActiveTab}
      />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingConflictsCount={stats?.pendingConflictsCount || 0}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              groups={groups}
              stats={stats}
              bookings={bookings}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              onSubmitBooking={handleSubmitBooking}
              onSelectBooking={setSelectedBooking}
              onQuickBookSlot={handleQuickBookSlot}
              availableSlots={availableSlots}
            />
          )}

          {activeTab === 'booking' && (
            <BookingView
              currentUser={currentUser}
              groups={groups}
              bookings={bookings}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              onSubmitBooking={handleSubmitBooking}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              bookings={bookings}
              groups={groups}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              onSelectBooking={setSelectedBooking}
              onQuickBookSlot={(slot) => {
                setActiveTab('booking');
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'my-bookings' && (
            <MyBookingsView
              currentUser={currentUser}
              bookings={bookings}
              onSelectBooking={setSelectedBooking}
              onNavigate={setActiveTab}
              onCancelBooking={(id) => {
                const b = bookings.find((item) => item.id === id);
                if (b) setSelectedBooking(b);
              }}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              currentUser={currentUser}
              groups={groups}
              users={users}
              onRefreshData={() => handleDateChange(selectedDate)}
            />
          )}
        </main>
      </div>

      {/* Detail & Cancel Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          currentUser={currentUser}
          onClose={() => setSelectedBooking(null)}
          onBookingCancelled={() => {
            handleDateChange(selectedDate);
          }}
        />
      )}
    </div>
  );
}
