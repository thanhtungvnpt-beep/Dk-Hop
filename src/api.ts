import {
  User,
  Group,
  Room,
  Booking,
  ConflictApproval,
  AuditLog,
  AppNotification,
  DashboardStats,
  TestResult
} from './types';

export const api = {
  // Current user & authentication switch
  async getMe(): Promise<User> {
    const res = await fetch('/api/me');
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async switchUser(userId: string): Promise<{ success: boolean; userId: string }> {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch user');
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ success: boolean }> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async createUser(data: { name: string; email: string; group_id: string; role: string }): Promise<{ success: boolean; id: string }> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create user');
    return result;
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    const res = await fetch('/api/groups');
    if (!res.ok) throw new Error('Failed to fetch groups');
    return res.json();
  },

  async updateGroupPriority(id: string, default_priority: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/groups/${id}/priority`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_priority }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update priority');
    return result;
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch('/api/rooms');
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  // Bookings
  async getBookings(params?: { date?: string; user_id?: string; group_id?: string; status?: string }): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.user_id) query.set('user_id', params.user_id);
    if (params?.group_id) query.set('group_id', params.group_id);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/bookings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async getBookingDetails(id: string): Promise<{ booking: Booking; history: AuditLog[] }> {
    const res = await fetch(`/api/bookings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch booking details');
    return res.json();
  },

  async createBooking(data: {
    room_id?: string;
    group_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    subject: string;
    participants_count?: number;
    notes?: string;
  }): Promise<{
    success: boolean;
    status: 'CONFIRMED' | 'CONFLICT';
    bookingId: string;
    message: string;
    conflict?: boolean;
    existingBooking?: any;
    availableSlots?: string[];
  }> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok && res.status !== 409 && res.status !== 202) {
      throw new Error(result.error || 'Lỗi khi tạo cuộc họp');
    }
    return result;
  },

  async cancelBooking(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to cancel booking');
    return result;
  },

  // Conflicts
  async getConflicts(): Promise<ConflictApproval[]> {
    const res = await fetch('/api/conflicts');
    if (!res.ok) throw new Error('Failed to fetch conflicts');
    return res.json();
  },

  async resolveConflict(id: string, action: 'APPROVE' | 'REJECT', reason: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/conflicts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to resolve conflict');
    return result;
  },

  // Available slots
  async getAvailableSlots(date: string): Promise<string[]> {
    const res = await fetch(`/api/available-slots?date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to fetch available slots');
    return res.json();
  },

  // Stats
  async getStats(date?: string): Promise<DashboardStats> {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`/api/stats${q}`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Run tests
  async runTests(): Promise<{ success: boolean; results: TestResult[]; passedCount: number; total: number }> {
    const res = await fetch('/api/admin/run-tests', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run tests');
    return res.json();
  },
};
