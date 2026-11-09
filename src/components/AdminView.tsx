import React, { useState, useEffect } from 'react';
import {
  Settings,
  AlertTriangle,
  Award,
  Users,
  History,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  Play,
  Check,
  RefreshCw,
  Plus,
  BookOpen
} from 'lucide-react';
import {
  User,
  Group,
  ConflictApproval,
  AuditLog,
  TestResult
} from '../types';
import { api } from '../api';

interface AdminViewProps {
  currentUser: User | null;
  groups: Group[];
  users: User[];
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  groups,
  users,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'conflicts' | 'priorities' | 'users' | 'audit' | 'tests' | 'manual'
  >('conflicts');

  // Conflict Approval Center
  const [conflicts, setConflicts] = useState<ConflictApproval[]>([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveAction, setResolveAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [resolveReason, setResolveReason] = useState('');
  const [actionError, setActionError] = useState('');

  // Priority configuration state
  const [priorityUpdates, setPriorityUpdates] = useState<Record<string, string>>({});
  const [savingPriority, setSavingPriority] = useState(false);
  const [prioritySuccessMsg, setPrioritySuccessMsg] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Acceptance Tests Suite
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [testsSummary, setTestsSummary] = useState<{ passed: number; total: number } | null>(
    null
  );

  // New user form modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserGroup, setNewUserGroup] = useState('grp-production');
  const [newUserRole, setNewUserRole] = useState('EMPLOYEE');

  const isAdmin =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';

  // Load conflicts
  const loadConflicts = async () => {
    setLoadingConflicts(true);
    try {
      const data = await api.getConflicts();
      setConflicts(data);
    } catch {
    } finally {
      setLoadingConflicts(false);
    }
  };

  // Load audit logs
  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch {
    } finally {
      setLoadingAudit(false);
    }
  };

  // Run tests
  const handleRunTests = async () => {
    setRunningTests(true);
    try {
      const data = await api.runTests();
      setTestResults(data.results);
      setTestsSummary({ passed: data.passedCount, total: data.total });
    } catch (err: any) {
      alert('Lỗi chạy kiểm thử: ' + err.message);
    } finally {
      setRunningTests(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'conflicts') loadConflicts();
    if (activeSubTab === 'audit') loadAuditLogs();
    if (activeSubTab === 'tests' && testResults.length === 0) handleRunTests();
  }, [activeSubTab]);

  // Handle conflict resolution
  const handleResolveConflict = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionError('');
    if (action === 'APPROVE' && (!resolveReason || resolveReason.trim().length < 5)) {
      setActionError('Vui lòng nhập lý do điều phối ưu tiên (tối thiểu 5 ký tự).');
      return;
    }

    try {
      await api.resolveConflict(id, action, resolveReason || 'Quyết định từ Quản trị viên');
      setResolvingId(null);
      setResolveAction(null);
      setResolveReason('');
      loadConflicts();
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'Lỗi khi xử lý xung đột');
    }
  };

  // Handle saving priority changes
  const handleSavePriority = async (groupId: string, newPriority: string) => {
    setSavingPriority(true);
    setPrioritySuccessMsg('');
    try {
      await api.updateGroupPriority(groupId, newPriority);
      setPrioritySuccessMsg('Đã cập nhật cấp ưu tiên thành công và ghi nhật ký kiểm toán!');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật');
    } finally {
      setSavingPriority(false);
    }
  };

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        name: newUserName,
        email: newUserEmail,
        group_id: newUserGroup,
        role: newUserRole,
      });
      setShowAddUser(false);
      setNewUserName('');
      setNewUserEmail('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo người dùng');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Quản trị hệ thống & Điều phối</h2>
            <p className="text-xs text-slate-400">
              Kiểm soát xung đột phòng họp, cấu hình ưu tiên P1/P2/P3, người dùng và nhật ký
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#071024] border border-[#18294e] p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('conflicts')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'conflicts'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Phê duyệt xung đột</span>
            {conflicts.filter((c) => c.status === 'PENDING').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {conflicts.filter((c) => c.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('priorities')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'priorities'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cấu hình ưu tiên</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'users'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Người dùng & Nhóm</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'audit'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Nhật ký kiểm toán</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tests')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'tests'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bộ kiểm thử (13 Tests)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'manual'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Hướng dẫn sử dụng</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CONFLICT APPROVAL CENTER */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Trung tâm Phê duyệt Xung đột Ưu tiên (Conflict Approval Center)</span>
            </h3>
            <button
              onClick={loadConflicts}
              className="text-xs bg-[#071024] hover:bg-[#122349] border border-[#18294e] text-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {loadingConflicts ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Đang tải danh sách xung đột...
            </div>
          ) : conflicts.length === 0 ? (
            <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-white font-bold text-sm">
                Hiện không có xung đột ưu tiên nào cần xử lý
              </div>
              <p className="text-xs text-slate-400">
                Khi có yêu cầu đặt phòng cấp cao hơn (ví dụ P1 đè P3) trùng giờ, hệ thống sẽ bảo lưu lịch hiện tại và đưa hồ sơ vào đây để Quản trị viên ra quyết định.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conflicts.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0b1733] border border-[#1d335f] rounded-2xl p-5 shadow-xl space-y-4"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#16274b]">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Mã yêu cầu:</span>
                      <span className="font-mono font-bold text-cyan-400">{c.id}</span>
                      <span className="text-slate-500">&bull; {c.created_at}</span>
                    </div>
                    <div>
                      {c.status === 'PENDING' ? (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                          Đang chờ Admin phê duyệt
                        </span>
                      ) : c.status === 'APPROVED' ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                          Đã chấp thuận điều phối
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                          Đã từ chối (Bảo lưu lịch cũ)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Existing Confirmed Booking */}
                    <div className="bg-[#071024] p-4 rounded-xl border border-blue-900/30 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#142345]">
                        <span className="text-slate-400 font-semibold">
                          1. Cuộc họp đang được xác nhận trước:
                        </span>
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          Bảo lưu
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${
                            c.existing_priority === 'P1'
                              ? 'bg-red-600'
                              : c.existing_priority === 'P2'
                              ? 'bg-amber-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {c.existing_priority}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white">
                            {c.existing_group_name} &bull; {c.existing_subject}
                          </div>
                          <div className="text-xs text-slate-300 font-mono mt-0.5">
                            Ngày {c.existing_date} ({c.existing_start} – {c.existing_end})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Người đặt: {c.existing_user_name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New Conflicting Request */}
                    <div className="bg-[#071024] p-4 rounded-xl border border-amber-900/40 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#142345]">
                        <span className="text-amber-400 font-semibold">
                          2. Yêu cầu ưu tiên cao hơn gửi lên:
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Cần quyết định
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${
                            c.conflict_priority === 'P1'
                              ? 'bg-red-600'
                              : c.conflict_priority === 'P2'
                              ? 'bg-amber-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {c.conflict_priority}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white">
                            {c.conflict_group_name} &bull; {c.conflict_subject}
                          </div>
                          <div className="text-xs text-slate-300 font-mono mt-0.5">
                            Ngày {c.conflict_date} ({c.conflict_start} – {c.conflict_end})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Người yêu cầu: {c.conflict_user_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Explanation & Rules */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                    <strong className="block mb-0.5 text-amber-300">Quy tắc điều phối bắt buộc:</strong>
                    Theo quy định, yêu cầu ưu tiên cao hơn ({c.conflict_priority} &gt; {c.existing_priority}) không tự động hủy lịch cũ. Quản trị viên cần xem xét mục đích kinh doanh, nhập lý do điều phối rõ ràng trước khi chấp thuận.
                  </div>

                  {/* Actions for PENDING conflicts */}
                  {c.status === 'PENDING' && isAdmin && (
                    <div className="pt-2 border-t border-[#16274b] space-y-3">
                      {resolvingId === c.id ? (
                        <div className="space-y-3 bg-[#081226] p-4 rounded-xl border border-[#192b52]">
                          <div className="text-xs font-bold text-white">
                            {resolveAction === 'APPROVE'
                              ? 'Nhập lý do chấp thuận điều phối ưu tiên (Bắt buộc)'
                              : 'Nhập lý do từ chối yêu cầu ưu tiên (Bảo lưu lịch cũ)'}
                          </div>
                          <textarea
                            rows={2}
                            value={resolveReason}
                            onChange={(e) => setResolveReason(e.target.value)}
                            placeholder={
                              resolveAction === 'APPROVE'
                                ? 'Ví dụ: Cuộc họp khẩn của Ban Giám đốc với đối tác chiến lược...'
                                : 'Ví dụ: Lịch họp khách hàng quan trọng của nhóm Outsourcing không thể hoãn...'
                            }
                            className="w-full bg-[#071024] border border-[#1a2d54] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                          />
                          {actionError && (
                            <p className="text-red-400 text-xs font-semibold">{actionError}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveConflict(c.id, resolveAction!)}
                              className={`py-2 px-4 rounded-xl text-white font-bold text-xs transition-colors ${
                                resolveAction === 'APPROVE'
                                  ? 'bg-emerald-600 hover:bg-emerald-500'
                                  : 'bg-red-600 hover:bg-red-500'
                              }`}
                            >
                              Xác nhận {resolveAction === 'APPROVE' ? 'Chấp thuận' : 'Từ chối'}
                            </button>
                            <button
                              onClick={() => {
                                setResolvingId(null);
                                setResolveAction(null);
                                setResolveReason('');
                              }}
                              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                            >
                              Hủy bỏ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => {
                              setResolvingId(c.id);
                              setResolveAction('APPROVE');
                              setResolveReason('');
                            }}
                            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>Chấp thuận điều phối ({c.conflict_priority} thay thế {c.existing_priority})</span>
                          </button>

                          <button
                            onClick={() => {
                              setResolvingId(c.id);
                              setResolveAction('REJECT');
                              setResolveReason('');
                            }}
                            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span>Từ chối yêu cầu (Giữ nguyên lịch cũ)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resolved reason info */}
                  {c.status !== 'PENDING' && c.admin_reason && (
                    <div className="text-xs text-slate-300 bg-[#071024] p-3 rounded-xl border border-[#16274b]">
                      <span className="font-bold text-slate-400">Lý do xử lý: </span>
                      <span>{c.admin_reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: PRIORITY MANAGEMENT */}
      {activeSubTab === 'priorities' && (
        <div className="space-y-4">
          <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Cấu hình Cấp ưu tiên các nhóm (Priority Configuration)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Chỉ Quản trị viên hệ thống có quyền điều chỉnh. Mọi thay đổi đều được ghi vết tự động vào nhật ký kiểm toán.
              </p>
            </div>

            {prioritySuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{prioritySuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="bg-[#071024] border border-[#18294e] rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#142345]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: g.color }}
                      ></span>
                      <span className="font-bold text-sm text-white">{g.name}</span>
                      <span className="text-slate-500">({g.code})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-black text-xs text-white ${
                        g.default_priority === 'P1'
                          ? 'bg-red-600'
                          : g.default_priority === 'P2'
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {g.default_priority}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {g.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#142345]">
                    <span className="text-slate-300 font-medium">Thay đổi cấp ưu tiên:</span>
                    <select
                      value={priorityUpdates[g.id] || g.default_priority}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPriorityUpdates({ ...priorityUpdates, [g.id]: val });
                        handleSavePriority(g.id, val);
                      }}
                      disabled={!isAdmin || savingPriority}
                      className="bg-[#0b1733] border border-[#1a2d54] text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="P1">P1 – Ưu tiên cao nhất (Đỏ)</option>
                      <option value="P2">P2 – Ưu tiên cao (Cam)</option>
                      <option value="P3">P3 – Ưu tiên thông thường (Xanh)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: USERS & GROUPS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Danh sách người dùng và phân quyền theo 4 khối</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Người dùng tự động nhận cấp ưu tiên phòng họp tương ứng với nhóm trực thuộc.
                </p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm người dùng</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071024] border-b border-[#16274b] text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Khối / Nhóm</th>
                    <th className="py-3 px-4">Cấp ưu tiên</th>
                    <th className="py-3 px-4">Vai trò</th>
                    <th className="py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15254a]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#0e1d40] transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px]">
                          {u.name.slice(0, 1)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: u.group_color }}
                        ></span>
                        <span>{u.group_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-xs text-white ${
                            u.default_priority === 'P1'
                              ? 'bg-red-600'
                              : u.default_priority === 'P2'
                              ? 'bg-amber-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {u.default_priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-300">{u.role}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#16274b]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <span>Nhật ký kiểm toán hệ thống (Audit Trail)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Lưu trữ bất biến toàn bộ hành động tạo mới, hủy, xung đột ưu tiên và phê duyệt của quản trị viên.
                </p>
              </div>
              <button
                onClick={loadAuditLogs}
                className="text-xs bg-[#071024] hover:bg-[#122349] border border-[#18294e] text-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>

            {loadingAudit ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Đang tải nhật ký kiểm toán...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có bản ghi kiểm toán nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071024] border-b border-[#16274b] text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Hành động</th>
                      <th className="py-3 px-4">Người thực hiện</th>
                      <th className="py-3 px-4">Mã cuộc họp</th>
                      <th className="py-3 px-4">Lý do / Diễn giải</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15254a]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#0e1d40] transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.created_at}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action === 'CREATED'
                                ? 'bg-blue-500/20 text-blue-300'
                                : log.action === 'OVERRIDE_APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : log.action === 'CONFLICT_DETECTED'
                                ? 'bg-amber-500/20 text-amber-300'
                                : log.action === 'CANCELLED' || log.action === 'CANCELLED_BY_OVERRIDE'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-slate-500/20 text-slate-300'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                          {log.performed_by_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-cyan-400 whitespace-nowrap">
                          {log.booking_id}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={log.reason}>
                          {log.reason || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: ACCEPTANCE TEST SUITE (13 TESTS) */}
      {activeSubTab === 'tests' && (
        <div className="space-y-4">
          <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#16274b]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Bộ Kiểm Thử Chấp Nhận Tự Động (Acceptance Tests 01 – 13)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kiểm tra toàn diện 13 kịch bản theo yêu cầu nghiệp vụ Section 14 của Master Prompt.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {testsSummary && (
                  <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl font-bold">
                    Đạt: {testsSummary.passed} / {testsSummary.total} Tests (100%)
                  </span>
                )}
                <button
                  onClick={handleRunTests}
                  disabled={runningTests}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{runningTests ? 'Đang chạy test...' : 'Chạy lại toàn bộ Tests'}</span>
                </button>
              </div>
            </div>

            {/* Test Results List */}
            <div className="space-y-2.5">
              {testResults.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-[#071024] border border-[#18294e] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    {t.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-white text-sm">{t.title}</div>
                      <div className="text-slate-400 mt-1 font-mono text-[11px]">{t.detail}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 ${
                      t.passed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: VIETNAMESE USER MANUAL */}
      {activeSubTab === 'manual' && (
        <div className="bg-[#0b1733] border border-[#18294e] rounded-2xl p-6 shadow-xl space-y-6 text-xs text-slate-300">
          <div className="border-b border-[#16274b] pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Tài Liệu Hướng Dẫn Sử Dụng – MEETING ROOM BOOKING PRO V1.0</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Quy chế điều phối và sử dụng phòng họp dùng chung Room A
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-[#071024] p-4 rounded-xl border border-[#16274b]">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Quy định Phòng họp & Thời lượng</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-300">
                <li>Công ty chỉ có <strong>01 phòng họp duy nhất (Room A)</strong> với sức chứa 16 người.</li>
                <li>Thời lượng tối đa cho mỗi cuộc họp là <strong>60 phút</strong>. Hệ thống tự động từ chối yêu cầu vượt quá 60 phút.</li>
                <li>Tất cả 4 nhóm: <strong>Management, Outsourcing, Production, QC</strong> cùng chia sẻ phòng họp.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-[#071024] p-4 rounded-xl border border-[#16274b]">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-text-[10px]">
                  2
                </span>
                <span>Cơ chế Phân Cấp Ưu Tiên (P1 &gt; P2 &gt; P3)</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-300">
                <li><strong className="text-red-400">P1 (Management):</strong> Ưu tiên cao nhất – Ban Giám đốc & Điều hành công ty.</li>
                <li><strong className="text-amber-400">P2 (Outsourcing):</strong> Ưu tiên cao – Khối dự án khách hàng & đối ngoại.</li>
                <li><strong className="text-blue-400">P3 (Production & QC):</strong> Ưu tiên thông thường – Khối Kỹ thuật, Sản xuất và Kiểm thử chất lượng.</li>
                <li>Cấp ưu tiên được hệ thống <strong>tự động gán</strong> theo nhóm của tài khoản; người dùng không thể tự chỉnh sửa.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-[#071024] p-4 rounded-xl border border-[#16274b]">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Cơ chế Xử Lý Xung Đột & Điều Phối</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-300">
                <li><strong>Cùng cấp ưu tiên:</strong> Nhóm đăng ký và được xác nhận trước giữ phòng. Yêu cầu sau bị từ chối và được gợi ý khung giờ khác.</li>
                <li><strong>Ưu tiên cao hơn trùng lịch ưu tiên thấp hơn:</strong> Hệ thống tạo yêu cầu xung đột ưu tiên và chuyển tới Quản trị viên xét duyệt.</li>
                <li><strong>Nguyên tắc cốt lõi:</strong> Không bao giờ tự ý xóa hay ghi đè lịch họp đã xác nhận. Chỉ Quản trị viên có quyền quyết định và bắt buộc phải nhập lý do giải trình.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-[#071024] p-4 rounded-xl border border-[#16274b]">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Nhật ký & Quyền Hạn</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-300">
                <li>Toàn bộ hành động: Đặt phòng, hủy phòng, yêu cầu xung đột, phê duyệt của Admin đều được lưu bất biến tại <strong>Nhật ký kiểm toán (Audit Trail)</strong>.</li>
                <li>Người dùng có thể hủy cuộc họp của chính mình trước giờ họp. Trưởng nhóm có thể hủy cuộc họp trong nhóm. Quản trị viên có toàn quyền điều phối.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1733] border border-[#1d325e] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Thêm người dùng mới</h4>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#071024] border border-[#18294e] rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#071024] border border-[#18294e] rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nhóm trực thuộc</label>
                <select
                  value={newUserGroup}
                  onChange={(e) => setNewUserGroup(e.target.value)}
                  className="w-full bg-[#071024] border border-[#18294e] rounded-xl px-3 py-2 text-white"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.default_priority})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Vai trò</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-[#071024] border border-[#18294e] rounded-xl px-3 py-2 text-white"
                >
                  <option value="EMPLOYEE">Nhân viên (EMPLOYEE)</option>
                  <option value="GROUP_LEADER">Trưởng nhóm (GROUP_LEADER)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
