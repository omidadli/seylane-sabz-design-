/**
 * سامانه جامع منابع انسانی سیلانه سبز (Seilaneh Sabz Enterprise HRMS)
 * Main Application Shell & State Controller
 */

import React, { useState, useEffect } from 'react';
import {
  Candidate,
  CandidateStage,
  ChecklistItem,
  Employee,
  JobPosting,
  LeaveBalance,
  LeaveRequest,
  PayrollSlip,
  PayrollStatus,
  PerformanceGoal,
  SkillMatrixItem,
  TrainingCourse,
  UserRole,
  HoldingDepartment,
  HRAutomationTask,
  HRDashboardMetrics,
} from './types';
import { Header } from './components/common/Header';
import { Sidebar, ModuleKey, MODULE_ACCESS } from './components/common/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AIBotGovernanceModule } from './components/ai-governance/AIBotGovernanceModule';
import { RecruitmentModule } from './components/recruitment/RecruitmentModule';
import { EmployeesModule } from './components/employees/EmployeesModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { PayrollModule } from './components/payroll/PayrollModule';
import { PerformanceModule } from './components/performance/PerformanceModule';
import { TrainingModule } from './components/training/TrainingModule';
import { ChecklistsModule } from './components/checklists/ChecklistsModule';
import { AnalyticsModule } from './components/analytics/AnalyticsModule';
import { MobileAppShell } from './components/mobile/MobileAppShell';
import { MobileVoiceCall } from './components/mobile/MobileVoiceCall';
import { MobileJobAdGenerator } from './components/mobile/MobileJobAdGenerator';
import { CommandPalette } from './components/common/CommandPalette';
import { FloatingQuickActions } from './components/common/FloatingQuickActions';
import { BottomNav } from './components/common/BottomNav';
import { Breadcrumbs } from './components/common/Breadcrumbs';
import { ToastContainer, showToast } from './components/common/Toast';
import { GlobalLoader } from './components/common/GlobalLoader';
import { Menu, X, Loader2 } from 'lucide-react';

/**
 * Fetch wrapper that surfaces REAL server errors (audit fix LEA-06):
 * previously every handler assumed success, so a 400/403/409 (over-quota
 * leave, locked payroll period, forbidden action) still showed a green
 * "success" toast while nothing happened.
 */
async function apiFetch(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `درخواست ناموفق (${res.status})`) as Error & { status?: number; data?: any };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const s2 = (p: PayrollSlip, paid: PayrollSlip[]): PayrollSlip => paid.find((x) => x.id === p.id) || p;

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});



export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.HR_DIRECTOR);
  const [sessionEmployeeId, setSessionEmployeeId] = useState<string>('emp-1');
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isJobAdModalOpen, setIsJobAdModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPwaPortalMode, setIsPwaPortalMode] = useState(false);

  // Application Data States
  const [departments, setDepartments] = useState<HoldingDepartment[]>([]);
  const [automationTasks, setAutomationTasks] = useState<HRAutomationTask[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [payrollSlips, setPayrollSlips] = useState<PayrollSlip[]>([]);
  const [performanceGoals, setPerformanceGoals] = useState<PerformanceGoal[]>([]);
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([]);
  const [skillMatrix, setSkillMatrix] = useState<SkillMatrixItem[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [metrics, setMetrics] = useState<HRDashboardMetrics>({
    activeHeadcount: 1350,
    openPositionsCount: 39,
    pendingLeavesCount: 7,
    turnoverRatePct: 3.8,
    costPerHireToman: 18500000,
    averageTimeToHireDays: 14,
    monthlyPayrollTotalToman: 42500000000,
  });

  // Listen to open-command-palette global trigger
  useEffect(() => {
    const handleOpenCommandPalette = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    return () => window.removeEventListener('open-command-palette', handleOpenCommandPalette);
  }, []);

  // Fetch initial data from Express backend
  const fetchData = async () => {
    try {
      fetch('/api/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.employeeId) setSessionEmployeeId(d.employeeId);
          if (d?.role) setCurrentRole(d.role);
        })
        .catch(() => undefined);
      const [
        jobsRes,
        candsRes,
        empsRes,
        attRes,
        leaveRes,
        balancesRes,
        payrollRes,
        goalsRes,
        coursesRes,
        skillsRes,
        checklistsRes,
        metricsRes,
        deptsRes,
        autoTasksRes,
      ] = await Promise.all([
        fetch('/api/jobs').then((r) => r.json()),
        fetch('/api/candidates').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
        fetch('/api/attendance').then((r) => r.json()),
        fetch('/api/leave/requests').then((r) => r.json()),
        fetch('/api/leave/balances').then((r) => r.json()),
        fetch('/api/payroll/slips').then((r) => r.json()),
        fetch('/api/performance/goals').then((r) => r.json()),
        fetch('/api/training/courses').then((r) => r.json()),
        fetch('/api/training/skill-matrix').then((r) => r.json()),
        fetch('/api/checklists').then((r) => r.json()),
        fetch('/api/analytics/metrics').then((r) => r.json()),
        fetch('/api/departments').then((r) => r.json()),
        fetch('/api/automation/tasks').then((r) => r.json()),
      ]);

      setJobs(jobsRes || []);
      setCandidates(candsRes || []);
      setEmployees(empsRes || []);
      setAttendances(attRes || []);
      setLeaveRequests(leaveRes || []);
      setLeaveBalances(Array.isArray(balancesRes) ? balancesRes : []);
      setPayrollSlips(payrollRes || []);
      setPerformanceGoals(goalsRes || []);
      setTrainingCourses(coursesRes || []);
      setSkillMatrix(skillsRes || []);
      setChecklists(checklistsRes || []);
      if (metricsRes) setMetrics(metricsRes);
      if (deptsRes) setDepartments(deptsRes);
      if (autoTasksRes) setAutomationTasks(autoTasksRes);
    } catch (err) {
      console.error('Failed to fetch HR data:', err);
      showToast('خطا در بارگذاری اولیه اطلاعات سازمانی', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Automation runs are IRREVERSIBLE-ish bulk operations (audit fix AIA-01):
   * an explicit user confirmation is always required, the server rejects runs
   * without confirm:true, and only HR_DIRECTOR may run them at all.
   */
  const handleRunAutomation = async (taskIdOrCategory: string) => {
    const task = automationTasks.find((t) => t.id === taskIdOrCategory);
    const taskTitle = task?.title || taskIdOrCategory;
    const confirmed = window.confirm(
      `اجرای فرآیند اتوماسیون «${taskTitle}»؟\n\nاین عملیات روی داده‌های واقعی سامانه اثر می‌گذارد و تنها با تایید صریح شما اجرا می‌شود.`
    );
    if (!confirmed) {
      showToast('اجرای اتوماسیون لغو شد', 'info');
      return;
    }
    try {
      const data = await apiFetch('/api/automation/run', jsonInit('POST', { taskId: taskIdOrCategory, confirm: true }));
      if (data.task) {
        setAutomationTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      }
      showToast(data.message || 'فرآیند اتوماسیون اجرا شد', 'success');
      // Side effects (finalized slips, recategorized candidates) must refresh.
      fetchData();
    } catch (err: any) {
      console.error('Automation run error:', err);
      showToast(err?.message || 'خطا در اجرای اتوماسیون', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /** Guarded module navigation (audit fix SEC-02). */
  const selectModule = (mod: ModuleKey) => {
    if (!MODULE_ACCESS[mod]?.includes(currentRole)) {
      showToast('نقش کاربری شما اجازه دسترسی به این بخش را ندارد', 'error');
      return;
    }
    setActiveModule(mod);
  };

  // Handlers for Role & Actions
  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    try {
      await apiFetch('/api/auth/switch-role', jsonInit('POST', { role: newRole }));
      showToast(`نقش کاربری به «${newRole}» تغییر یافت`, 'info');
      // Data visibility is role-scoped on the server — reload everything and
      // leave modules the new role may not access.
      setActiveModule((mod) => (MODULE_ACCESS[mod]?.includes(newRole) ? mod : 'dashboard'));
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در تغییر نقش کاربری', 'error');
    }
  };

  // Module 1: Recruitment handlers
  const handleUpdateCandidateStage = async (candidateId: string, nextStage: CandidateStage) => {
    try {
      const updated = await apiFetch(`/api/candidates/${candidateId}/stage`, jsonInit('PATCH', { stage: nextStage }));
      if (updated?.createdEmployee) {
        // HIRED: the server created the personnel file + onboarding checklist.
        showToast('کارجو استخدام شد؛ پرونده پرسنلی و چک‌لیست آنبوردینگ خودکار ایجاد گردید', 'success');
        fetchData();
        return;
      }
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? updated : c)));
      showToast('مرحله کارجو با موفقیت در کانبان به‌روزرسانی شد', 'success');
    } catch (err: any) {
      console.error(err);
      // 409 = illegal transition / unmet HIRED gate — show the real reason.
      showToast(err?.message || 'خطا در به‌روزرسانی مرحله کارجو', 'error');
    }
  };

  const handleScheduleInterview = async (
    candidateId: string,
    interviewJalali: string,
    interviewType: string,
    notes?: string
  ) => {
    try {
      const updated = await apiFetch(`/api/candidates/${candidateId}/schedule-interview`, jsonInit('POST', { interviewJalali, interviewType, interviewNotes: notes }));
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? updated : c)));
      showToast('مصاحبه تخصصی حضوری با موفقیت تنظیم شد', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در تنظیم مصاحبه', 'error');
    }
  };

  const handleToggleTalentPool = async (candidateId: string, inPool: boolean) => {
    try {
      const updated = await apiFetch(`/api/candidates/${candidateId}/talent-pool`, jsonInit('PATCH', { inTalentPool: inPool }));
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? updated : c)));
      showToast(inPool ? 'کارجو به استخر استعدادها اضافه شد' : 'کارجو از استخر استعدادها خارج شد', 'info');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در بروزرسانی استخر استعداد', 'error');
    }
  };

  const handleCreateJob = async (newJob: Partial<JobPosting>) => {
    try {
      const created = await apiFetch('/api/jobs', jsonInit('POST', newJob));
      setJobs((prev) => [created, ...prev]);
      showToast(`موقعیت شغلی «${created.title}» با موفقیت افزوده شد`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در ثبت موقعیت شغلی', 'error');
    }
  };

  const handleBulkUploadSuccess = () => {
    fetchData();
    showToast('بارگذاری گروهی رزومه‌ها با موفقیت انجام شد', 'success');
  };

  const handleDraftEmail = async (candidate: Candidate, type: 'INVITATION' | 'REJECTION') => {
    try {
      const subject =
        type === 'INVITATION'
          ? 'دعوت به مصاحبه تخصصی حضوری - هلدینگ سیلانه سبز'
          : 'نتیجه ارزیابی اولیه رزومه - هلدینگ سیلانه سبز';
      const body =
        type === 'INVITATION'
          ? `کارجوی گرامی جناب آقای / سرکار خانم ${candidate.fullName}،\nبا سلام، بدین‌وسیله از شما جهت مصاحبه تخصصی دعوت به عمل می‌آید.`
          : `کارجوی گرامی،\nبا تشکر از ارسال رزومه، مشخصات شما در استخر استعدادهای سازمانی ذخیره شد.`;

      await apiFetch(`/api/candidates/${candidate.id}/draft-email`, jsonInit('POST', { type, subject, body }));

      showToast(
        `پیش‌نویس ایمیل ${type === 'INVITATION' ? 'دعوت به مصاحبه' : 'عدم احراز'} برای ${candidate.fullName} ذخیره شد (ارسال خودکار انجام نمی‌شود)`,
        'info'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در ذخیره پیش‌نویس ایمیل', 'error');
    }
  };

  // Module 2: Employee Handlers
  const handleCreateEmployee = async (newEmp: Partial<Employee>) => {
    try {
      const created = await apiFetch('/api/employees', jsonInit('POST', newEmp));
      setEmployees((prev) => [...prev, created]);
      showToast(`پرونده پرسنلی همکار جدید «${created.fullName}» ثبت گردید`, 'success');
    } catch (err: any) {
      console.error(err);
      // Surface real validation errors (national-id checksum, duplicates, ...).
      showToast(err?.message || 'خطا در ایجاد پرونده پرسنلی', 'error');
    }
  };

  // Module 3: Attendance Handlers
  const handleCheckInOut = async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    try {
      const updated = await apiFetch('/api/attendance/check-in-out', jsonInit('POST', { type }));
      setAttendances((prev) => {
        const idx = prev.findIndex((a) => a.id === updated.id);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = updated;
          return clone;
        }
        return [updated, ...prev];
      });
      showToast(
        updated?.notice
          ? updated.notice
          : type === 'CHECK_IN'
            ? 'ورود شما در ساعت جاری با موفقیت ثبت شد.'
            : 'خروج شما با موفقیت ثبت شد.',
        updated?.notice ? 'info' : 'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در ثبت تردد', 'error');
    }
  };

  /**
   * Leave requests are validated against the statutory balance engine
   * (audit fix LEA-01/02). The server derives the working-day count from the
   * Jalali date range and rejects over-quota requests, so the response (not
   * the form input) is what gets stored in state.
   */
  const handleSubmitLeave = async (req: Partial<LeaveRequest>) => {
    try {
      const created = await apiFetch('/api/leave/requests', jsonInit('POST', req));
      setLeaveRequests((prev) => [created, ...prev]);
      setLeaveBalances((prev) => (created?.balance ? prev.map((b) => (b.employeeId === created.balance.employeeId ? created.balance : b)) : prev));
      showToast(
        `درخواست مرخصی به مدت ${created?.daysCount ?? req.daysCount} روز کاری ثبت شد و در کارتابل بررسی مدیر قرار گرفت`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در ثبت درخواست مرخصی', 'error');
    }
  };

  const handleApproveLeave = async (id: string, approved: boolean, comment?: string) => {
    try {
      const updated = await apiFetch(`/api/leave/requests/${id}/approve`, jsonInit('PATCH', { approved, comment }));
      setLeaveRequests((prev) => prev.map((l) => (l.id === id ? updated : l)));
      if (updated?.balance) {
        setLeaveBalances((prev) => prev.map((b) => (b.employeeId === updated.balance.employeeId ? updated.balance : b)));
      }
      showToast(approved ? 'درخواست مرخصی تأیید شد' : 'درخواست مرخصی رد گردید', 'info');
    } catch (err: any) {
      console.error(err);
      // 409 = insufficient statutory balance / already decided.
      showToast(err?.message || 'خطا در بررسی درخواست مرخصی', 'error');
    }
  };

  // Module 4: Payroll Handlers
  /**
   * Payroll generation (audit fixes PAY-02/PAY-04/PAY-10): the year must have
   * a configured statutory circular, new slips are DRAFT (not silently
   * FINALIZED), and a period with FINALIZED slips requires an explicit
   * force confirmation before it can be regenerated.
   */
  const handleGeneratePayroll = async (monthJalali: number, yearJalali: number) => {
    const run = async (force: boolean) =>
      apiFetch('/api/payroll/generate', jsonInit('POST', { monthJalali, yearJalali, force }));
    try {
      let data = await run(false);
      setPayrollSlips((prev) => [
        ...prev.filter((p) => !(p.yearJalali === yearJalali && p.monthJalali === monthJalali)),
        ...data.slips,
      ]);
      const skippedNote = data.skipped?.length ? ` — ${data.skipped.length} پرونده بدون فیش (به دلایل ثبت‌شده)` : '';
      showToast(`فیش‌های پیش‌نویس دوره با بیمه ۷٪ و مالیات پله‌ای بخشنامه ${yearJalali} تولید شد${skippedNote}`, 'success');
    } catch (err: any) {
      if (err?.status === 409 && err?.data?.requiresForce) {
        const ok = window.confirm(
          `${err.data.finalizedCount} فیش این دوره FINALIZED است.\nبازتولید، فیش‌های نهایی‌شده را با محاسبات جدید جایگزین می‌کند (فیش‌های پرداخت‌شده تغییر نمی‌کنند).\n\nادامه می‌دهید؟`
        );
        if (!ok) {
          showToast('بازتولید فیش‌های دوره لغو شد', 'info');
          return;
        }
        try {
          const data = await run(true);
          setPayrollSlips((prev) => [
            ...prev.filter(
              (p) => !(p.yearJalali === yearJalali && p.monthJalali === monthJalali && p.status !== PayrollStatus.PAID)
            ),
            ...data.slips,
          ]);
          showToast('فیش‌های دوره با تایید شما بازتولید شد', 'success');
        } catch (e2: any) {
          showToast(e2?.message || 'خطا در بازتولید فیش‌ها', 'error');
        }
        return;
      }
      console.error(err);
      showToast(err?.message || 'خطا در محاسبه حقوق', 'error');
    }
  };

  // Module 5: Performance Handlers
  const handleUpdateGoalProgress = async (id: string, progress: number) => {
    try {
      const updated = await apiFetch(`/api/performance/goals/${id}`, jsonInit('PATCH', { currentProgress: progress }));
      setPerformanceGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      showToast('پیشرفت هدف سازمانی ثبت شد', 'info');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در ثبت پیشرفت هدف', 'error');
    }
  };

  const handleCreateGoal = async (newGoal: Partial<PerformanceGoal>) => {
    try {
      const created = await apiFetch('/api/performance/goals', jsonInit('POST', newGoal));
      setPerformanceGoals((prev) => [created, ...prev]);
      showToast('هدف عملکردی جدید با موفقیت اضافه شد', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در ثبت هدف عملکردی', 'error');
    }
  };

  /** DRAFT → FINALIZED for a period (audit fix PAY-10: real lifecycle). */
  const handleFinalizePayroll = async (yearJalali: number, monthJalali: number) => {
    try {
      const data = await apiFetch('/api/payroll/finalize', jsonInit('POST', { yearJalali, monthJalali }));
      setPayrollSlips((prev) => prev.map((p) => (data.slips.some((s: PayrollSlip) => s.id === p.id) ? { ...p, status: PayrollStatus.FINALIZED } : p)));
      showToast(data.message || 'فیش‌ها نهایی شدند', 'success');
    } catch (err: any) {
      showToast(err?.message || 'خطا در نهایی‌سازی فیش‌ها', 'error');
    }
  };

  /** FINALIZED → PAID (locks the period). */
  const handleMarkPaid = async (yearJalali: number, monthJalali: number) => {
    const ok = window.confirm(
      `ثبت پرداخت فیش‌های دوره ${yearJalali}/${monthJalali}؟\n\nپس از ثبت پرداخت، این دوره قفل شده و فیش‌ها قابل تغییر نیستند.`
    );
    if (!ok) return;
    try {
      const data = await apiFetch('/api/payroll/mark-paid', jsonInit('POST', { yearJalali, monthJalali }));
      setPayrollSlips((prev) => prev.map((p) => (data.slips.some((s: PayrollSlip) => s.id === p.id) ? s2(p, data.slips) : p)));
      showToast(data.message || 'پرداخت ثبت شد', 'success');
    } catch (err: any) {
      showToast(err?.message || 'خطا در ثبت پرداخت', 'error');
    }
  };

  // Module 6: real course enrollment (audit fix MOD-04: alert() → API)
  const handleEnrollCourse = async (courseId: string, employeeId?: string) => {
    try {
      const enrollment = await apiFetch('/api/training/enroll', jsonInit('POST', { courseId, employeeId }));
      showToast(`ثبت‌نام دوره با موفقیت انجام شد (${enrollment.enrolledAtJalali})`, 'success');
      return true;
    } catch (err: any) {
      showToast(err?.message || 'خطا در ثبت‌نام دوره', 'error');
      return false;
    }
  };

  // Module 7: Checklists Handlers
  const handleToggleChecklist = async (id: string) => {
    try {
      const updated = await apiFetch(`/api/checklists/${id}/toggle`, { method: 'PATCH' });
      setChecklists((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'خطا در بروزرسانی چک‌لیست', 'error');
    }
  };

  // Dedicated Factory PWA Mobile Portal View (Optional Toggle)
  if (isPwaPortalMode) {
    return (
      <MobileAppShell
        metrics={metrics}
        departments={departments}
        automationTasks={automationTasks}
        employees={employees}
        leaves={leaveRequests}
        payrollSlips={payrollSlips}
        onRunAutomation={handleRunAutomation}
        onJobCreated={handleCreateJob}
        onExitToDesktop={() => setIsPwaPortalMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 text-text-1 font-sans flex flex-col selection:bg-brand/20 selection:text-brand transition-colors">
      {/* Top Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenJobGenerator={() => setIsJobAdModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeModuleTitle={
          activeModule === 'dashboard'
            ? 'پیشخوان هوشمند'
            : activeModule === 'recruitment'
            ? 'جذب و استخدام'
            : activeModule === 'employees'
            ? 'پرونده پرسنلی'
            : activeModule === 'attendance'
            ? 'تردد و مرخصی‌ها'
            : activeModule === 'payroll'
            ? 'حقوق و دستمزد'
            : activeModule === 'performance'
            ? 'مدیریت عملکرد'
            : activeModule === 'training'
            ? 'آموزش و مهارت‌ها'
            : activeModule === 'checklists'
            ? 'چک‌لیست‌های خدمت'
            : activeModule === 'analytics'
            ? 'هوش تجاری و گزارشات'
            : 'حاکمیت هوش مصنوعی'
        }
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={selectModule}
          currentRole={currentRole}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 min-w-0 overflow-y-auto p-2.5 sm:p-4 md:p-6 lg:p-7 max-w-7xl mx-auto w-full pb-28 lg:pb-12 touch-scroll">
          {isLoading ? (
            <GlobalLoader message="در حال فراخوانی داده‌های سازمانی و پایش کارخانجات سیلانه سبز..." />
          ) : (
            <>
              {/* Breadcrumbs & Quick Context Switcher */}
              <Breadcrumbs
                activeModule={activeModule}
                onSelectModule={selectModule}
                currentRole={currentRole}
                isPwaPortalMode={isPwaPortalMode}
                onTogglePwaPortalMode={() => setIsPwaPortalMode(!isPwaPortalMode)}
              />

              {/* Module 0: Executive 360 Dashboard */}
              {activeModule === 'dashboard' && (
                <ExecutiveDashboard
                  currentRole={currentRole}
                  metrics={metrics}
                  departments={departments}
                  jobs={jobs}
                  candidates={candidates}
                  attendances={attendances}
                  employees={employees}
                  leaveRequests={leaveRequests}
                  payrollSlips={payrollSlips}
                  checklists={checklists}
                  trainingCourses={trainingCourses}
                  performanceGoals={performanceGoals}
                  onNavigate={(mod) => selectModule(mod)}
                  onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
                  onOpenJobGenerator={() => setIsJobAdModalOpen(true)}
                  onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                />
              )}

              {/* Module AI Bot Governance & Command Center */}
              {activeModule === 'ai-governance' && (
                <AIBotGovernanceModule
                  candidates={candidates}
                  jobs={jobs}
                />
              )}

              {/* Module 1: Recruitment & Screening */}
              {activeModule === 'recruitment' && (
                <RecruitmentModule
                  currentRole={currentRole}
                  jobs={jobs}
                  candidates={candidates}
                  onUpdateCandidateStage={handleUpdateCandidateStage}
                  onScheduleInterview={handleScheduleInterview}
                  onToggleTalentPool={handleToggleTalentPool}
                  onCreateJob={handleCreateJob}
                  onBulkUploadSuccess={handleBulkUploadSuccess}
                  onDraftEmail={handleDraftEmail}
                  onJobUpdated={(updatedJob) => {
                    setJobs((prev) =>
                      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
                    );
                  }}
                />
              )}

              {/* Module 2: Employees & Org Chart */}
              {activeModule === 'employees' && (
                <EmployeesModule
                  employees={employees}
                  currentRole={currentRole}
                  onCreateEmployee={handleCreateEmployee}
                />
              )}

              {/* Module 3: Attendance & Leaves */}
              {activeModule === 'attendance' && (
                <AttendanceModule
                  currentRole={currentRole}
                  attendances={attendances}
                  leaveRequests={leaveRequests}
                  leaveBalances={leaveBalances}
                  employees={employees}
                  sessionEmployeeId={sessionEmployeeId}
                  onCheckInOut={handleCheckInOut}
                  onSubmitLeaveRequest={handleSubmitLeave}
                  onApproveLeave={handleApproveLeave}
                />
              )}

              {/* Module 4: Payroll & Insurance */}
              {activeModule === 'payroll' && (
                <PayrollModule
                  payrollSlips={payrollSlips}
                  currentRole={currentRole}
                  employees={employees}
                  onGeneratePayroll={handleGeneratePayroll}
                  onFinalizePayroll={handleFinalizePayroll}
                  onMarkPaid={handleMarkPaid}
                />
              )}

              {/* Module 5: Performance OKRs */}
              {activeModule === 'performance' && (
                <PerformanceModule
                  goals={performanceGoals}
                  onUpdateProgress={handleUpdateGoalProgress}
                  onCreateGoal={handleCreateGoal}
                />
              )}

              {/* Module 6: Training & Skills */}
              {activeModule === 'training' && (
                <TrainingModule
                  courses={trainingCourses}
                  skillMatrix={skillMatrix}
                  currentRole={currentRole}
                  employees={employees}
                  onEnroll={handleEnrollCourse}
                />
              )}

              {/* Module 7: Checklists Onboarding */}
              {activeModule === 'checklists' && (
                <ChecklistsModule
                  checklists={checklists}
                  onToggleChecklist={handleToggleChecklist}
                />
              )}

              {/* Module 8: Analytics & KPIs */}
              {activeModule === 'analytics' && <AnalyticsModule metrics={metrics} candidates={candidates} />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (1-Click Instant Access) */}
      <BottomNav
        activeModule={activeModule}
        onSelectModule={selectModule}
        currentRole={currentRole}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Floating Quick Actions Speed Dial */}
      <FloatingQuickActions
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenJobGenerator={() => setIsJobAdModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 3-Click Command Palette (Ctrl+K Spotlight) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectModule={selectModule}
        currentRole={currentRole}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenJobGenerator={() => setIsJobAdModalOpen(true)}
        jobs={jobs}
        candidates={candidates}
      />

      {/* Desktop Modal for AI Voice Assistant */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
          <div className="w-full max-w-xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border border-emerald-500/30 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsVoiceModalOpen(false)}
              className="absolute top-4 left-4 z-50 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <MobileVoiceCall
              onBack={() => setIsVoiceModalOpen(false)}
              onNavigateToJobAd={() => {
                setIsVoiceModalOpen(false);
                setIsJobAdModalOpen(true);
              }}
              onRunAutomation={(cat) => handleRunAutomation(cat)}
            />
          </div>
        </div>
      )}

      {/* Desktop Modal for AI Job Ad Generator */}
      {isJobAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsJobAdModalOpen(false)}
              className="absolute top-4 left-4 z-50 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-4 sm:p-6">
              <MobileJobAdGenerator
                departments={departments}
                onBack={() => setIsJobAdModalOpen(false)}
                onJobCreated={(job) => {
                  handleCreateJob(job);
                  setIsJobAdModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
}
