import React, { useState } from 'react';
import {
  Home,
  Building2,
  Mic,
  FileText,
  Users,
  Bell,
  PhoneCall,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { MobileHome } from './MobileHome';
import { MobileDepartments } from './MobileDepartments';
import { MobileVoiceCall } from './MobileVoiceCall';
import { MobileJobAdGenerator } from './MobileJobAdGenerator';
import { MobilePersonnelPortal } from './MobilePersonnelPortal';
import { MobileAutomations } from './MobileAutomations';
import {
  Employee,
  HoldingDepartment,
  HRAutomationTask,
  HRDashboardMetrics,
  LeaveRequest,
  PayrollSlip,
} from '../../types';

interface MobileAppShellProps {
  metrics: HRDashboardMetrics;
  departments: HoldingDepartment[];
  automationTasks: HRAutomationTask[];
  employees: Employee[];
  leaves: LeaveRequest[];
  payrollSlips: PayrollSlip[];
  onRunAutomation: (taskId: string) => Promise<void>;
  onJobCreated?: (newJob: any) => void;
  onExitToDesktop?: () => void;
}

export type MobileTab = 'home' | 'departments' | 'voice' | 'jobAd' | 'portal' | 'automations';

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  metrics,
  departments,
  automationTasks,
  employees,
  leaves,
  payrollSlips,
  onRunAutomation,
  onJobCreated,
  onExitToDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [notificationCount, setNotificationCount] = useState(3);
  const [jobAdDeptId, setJobAdDeptId] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800 antialiased selection:bg-emerald-200">
      <div className="w-full max-w-xl mx-auto min-h-screen flex flex-col bg-slate-50 relative shadow-xl overflow-x-hidden">
        {/* Mobile App Bar */}
        <header className="sticky top-0 bg-emerald-900 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-800/80 shadow-md z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <span className="text-sm">🌿</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">سیلانه سبز</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                  HRMS
                </span>
              </div>
              <span className="text-[10px] text-emerald-300/80 block">دافی • کامان • میس‌ویک • کاپوت</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExitToDesktop && (
              <button
                onClick={onExitToDesktop}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-[11px] font-bold flex items-center gap-1 border border-emerald-700 transition-colors"
                title="مشاهده نسخه جامع سازمانی هلدینگ"
              >
                <Laptop className="w-3.5 h-3.5 text-emerald-300" />
                <span>نسخه جامع</span>
              </button>
            )}

            {/* Direct Voice Call Icon */}
            <button
              onClick={() => setActiveTab('voice')}
              className="w-9 h-9 rounded-full bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center cursor-pointer transition-colors relative shadow-inner"
              title="تماس صوتی فوری با هوش مصنوعی"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setActiveTab('automations')}
              className="w-9 h-9 rounded-full bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center cursor-pointer transition-colors relative"
              title="اتوماسیون‌ها و اعلان‌ها"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Mobile Tab Body */}
        <main className="flex-1 pb-20 overflow-y-auto">
          {activeTab === 'home' && (
            <MobileHome
              metrics={metrics}
              departments={departments}
              automationTasks={automationTasks}
              tasks={automationTasks}
              onNavigateToVoice={() => setActiveTab('voice')}
              onNavigateToJobAd={() => setActiveTab('jobAd')}
              onNavigateToDepartments={() => setActiveTab('departments')}
              onNavigateToAutomations={() => setActiveTab('automations')}
              onNavigateToPortal={() => setActiveTab('portal')}
              onQuickRunAutomation={onRunAutomation}
              onNavigate={(tab) => setActiveTab(tab)}
              onRunTask={onRunAutomation}
            />
          )}

          {activeTab === 'departments' && (
            <MobileDepartments
              departments={departments}
              onBack={() => setActiveTab('home')}
              onSelectDepartmentForJob={(dept) => {
                setJobAdDeptId(dept.id);
                setActiveTab('jobAd');
              }}
            />
          )}

          {activeTab === 'voice' && (
            <div className="p-3 sm:p-4">
              <MobileVoiceCall
                onBack={() => setActiveTab('home')}
                onNavigateToJobAd={() => setActiveTab('jobAd')}
                onNavigateToDepartments={() => setActiveTab('departments')}
                onRunAutomation={(cat) => onRunAutomation(cat)}
              />
            </div>
          )}

          {activeTab === 'jobAd' && (
            <div className="p-3 sm:p-4">
              <MobileJobAdGenerator
                departments={departments}
                initialDeptId={jobAdDeptId}
                onBack={() => setActiveTab('home')}
                onJobCreated={(job) => {
                  if (onJobCreated) onJobCreated(job);
                  setActiveTab('portal');
                }}
              />
            </div>
          )}

          {activeTab === 'portal' && (
            <MobilePersonnelPortal
              employees={employees}
              leaves={leaves}
              payrollSlips={payrollSlips}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'automations' && (
            <MobileAutomations
              tasks={automationTasks}
              onRunTask={onRunAutomation}
              onBack={() => setActiveTab('home')}
            />
          )}
        </main>

        {/* Bottom Mobile Tab Bar */}
        <nav className="fixed bottom-0 inset-x-0 max-w-xl mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.08)]">
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">خانه</span>
          </button>

          {/* Tab 2: Departments */}
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'departments' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className={`w-5 h-5 ${activeTab === 'departments' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">دپارتمان‌ها</span>
          </button>

          {/* Tab 3: Center Highlighted Voice Call Button */}
          <button
            onClick={() => setActiveTab('voice')}
            className="flex flex-col items-center gap-0.5 -mt-5 cursor-pointer group"
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all transform group-active:scale-95 border-2 border-white ${
                activeTab === 'voice'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/50 scale-105'
                  : 'bg-emerald-600 text-white shadow-emerald-600/40 hover:bg-emerald-500'
              }`}
            >
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <span
              className={`text-[10px] font-bold ${
                activeTab === 'voice' ? 'text-emerald-700' : 'text-slate-600'
              }`}
            >
              تماس صوتی
            </span>
          </button>

          {/* Tab 4: AI Job Ad */}
          <button
            onClick={() => setActiveTab('jobAd')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'jobAd' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'jobAd' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">آگهی‌ساز</span>
          </button>

          {/* Tab 5: Administrative Portal */}
          <button
            onClick={() => setActiveTab('portal')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'portal' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'portal' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">کارتابل</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
