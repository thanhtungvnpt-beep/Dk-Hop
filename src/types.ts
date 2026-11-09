export type PriorityLevel = 'P1' | 'P2' | 'P3';

export type UserRole = 'EMPLOYEE' | 'GROUP_LEADER' | 'ADMIN' | 'SYSTEM_ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CONFLICT'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  group_id: string;
  role: UserRole;
  is_active: number;
  group_name?: string;
  group_code?: string;
  default_priority?: PriorityLevel;
  group_color?: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  default_priority: PriorityLevel;
  color: string;
  description?: string;
  priority_name?: string;
  priority_rank?: number;
}

export interface PriorityInfo {
  level: PriorityLevel;
  name: string;
  rank: number;
  description: string;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  max_duration_mins: number;
  status: string;
}

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  subject: string;
  participants_count: number;
  priority: PriorityLevel;
  notes?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  organizer_name?: string;
  organizer_email?: string;
  group_name?: string;
  group_code?: string;
  group_color?: string;
}

export interface ConflictApproval {
  id: string;
  conflict_booking_id: string;
  existing_booking_id: string;
  requested_by_user_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_reason?: string;
  reviewed_by_user_id?: string;
  reviewed_at?: string;
  created_at: string;
  conflict_subject: string;
  conflict_date: string;
  conflict_start: string;
  conflict_end: string;
  conflict_priority: PriorityLevel;
  conflict_group_name: string;
  conflict_group_color: string;
  conflict_user_name: string;
  existing_subject: string;
  existing_date: string;
  existing_start: string;
  existing_end: string;
  existing_priority: PriorityLevel;
  existing_group_name: string;
  existing_group_color: string;
  existing_user_name: string;
}

export interface AuditLog {
  id: string;
  booking_id: string;
  action: string;
  performed_by_user_id: string;
  performed_by_name: string;
  performed_by_email?: string;
  previous_values_json?: string;
  new_values_json?: string;
  reason?: string;
  created_at: string;
  booking_subject?: string;
  booking_date?: string;
  booking_start?: string;
  booking_end?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  booking_id?: string;
  is_read: number;
  created_at: string;
}

export interface DashboardStats {
  todayMeetingsCount: number;
  activeGroupsCount: number;
  totalGroupsCount: number;
  maxDurationMinutes: number;
  priorityMechanism: string;
  nextMeeting: Booking | null;
  recentBookings: Booking[];
  pendingConflictsCount: number;
}

export interface TestResult {
  id: string;
  title: string;
  passed: boolean;
  detail: string;
}
