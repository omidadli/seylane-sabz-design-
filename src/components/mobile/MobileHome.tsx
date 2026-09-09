import React from 'react';
import {
  Sparkles,
  Mic,
  FileText,
  Building2,
  Zap,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  TrendingUp,
  Award,
  Layers,
  PhoneCall,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { HoldingDepartment, HRAutomationTask, HRDashboardMetrics } from '../../types';

interface MobileHomeProps {
  metrics?: HRDashboardMetrics;
  departments?: HoldingDepartment[];
  automationTasks?: HRAutomationTask[];
  tasks?: HRAutomationTask[];
  onNavigateToVoice?: () => void;
  onNavigateToJobAd?: () => void;
  onNavigateToDepartments?: () => void;
  onNavigateToAutomations?: () => void;
  onNavigateToPortal?: () => void;
  onQuickRunAutomation?: (taskId: string) => Promise<void> | void;
  onNavigate?: (tab: any) => void;
  onRunTask?: (taskId: string) => Promise<void> | void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({
  metrics,
  departments = [],
  automationTasks,
  tasks,
  onNavigateToVoice,
  onNavigateToJobAd,
  onNavigateToDepartments,
  onNavigateToAutomations,
  onNavigateToPortal,
  onQuickRunAutomation,
  onNavigate,
  onRunTask,
}) => {
  const taskList = automationTasks || tasks || [];
  const handleGoVoice = onNavigateToVoice || (() => onNavigate?.('voice'));
  const handleGoJobAd = onNavigateToJobAd || (() => onNavigate?.('jobAd'));
  const handleGoDepartments = onNavigateToDepartments || (() => onNavigate?.('departments'));
  const handleGoAutomations = onNavigateToAutomations || (() => onNavigate?.('automations'));
  const handleGoPortal = onNavigateToPortal || (() => onNavigate?.('portal'));
  const handleRun = onQuickRunAutomation || onRunTask || (async () => {});
  return (
    <div className="space-y-4 pb-14">
      {/* Welcome & Brand Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-12 -translate-y-12 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top Row: Holding Badge & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="text-xs font-black tracking-wide text-white block">
                  هلدینگ سیلانه سبز
                </span>
                <span className="text-[10px] text-emerald-300/90 font-mono">SEILANEH SABZ HOLDING</span>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-[11px] font-medium border border-white/10 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-300" />
              <span>امروز: ۲۵ شهریور ۱۴۰۳</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="pt-1">
            <h1 className="text-base sm:text-lg font-black text-white">
              روز بخیر، مهندس سهرابی عزیز! 👋
            </h1>
            <p className="text-xs text-emerald-100/80 leading-relaxed mt-0.5">
              سامانه هوشمند منابع انسانی فعال است؛ پایش لحظه‌ای ۱۳۵۰ پرسنل و ۱۰ دپارتمان تخصصی هلدینگ.
            </p>
          </div>

          {/* Big Voice Assistant Trigger Banner */}
          <div
            onClick={handleGoVoice}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-700/80 to-teal-700/80 hover:from-emerald-600 hover:to-teal-600 border border-emerald-400/40 shadow-lg flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center shadow-md animate-pulse">
                <PhoneCall className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs font-black text-white flex items-center gap-1">
                  تماس صوتی مستقیم با دستیار AI
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-bold">
                    جدید
                  </span>
                </span>
                <span className="text-[10px] text-emerald-200 block mt-0.5">
                  لمس کنید و بگویید: «یک آگهی برای مدیر برند دافی بنویس»
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Navigation Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Tile 1: AI Job Ad Generator */}
        <button
          onClick={handleGoJobAd}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 text-right cursor-pointer transition-all active:scale-95 space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">تولید آگهی و JD</span>
            <span className="text-[10px] text-slate-400">با هوش مصنوعی Gemini</span>
          </div>
        </button>

        {/* Tile 2: Holding Departments */}
        <button
          onClick={handleGoDepartments}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 text-right cursor-pointer transition-all active:scale-95 space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">۱۰ دپارتمان</span>
            <span className="text-[10px] text-slate-400">کارخانجات و ستاد</span>
          </div>
        </button>

        {/* Tile 3: Fast Automations */}
        <button
          onClick={handleGoAutomations}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 text-right cursor-pointer transition-all active:scale-95 space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">اتوماسیون HR</span>
            <span className="text-[10px] text-slate-400">۱۲۸ ساعت صرفه‌جویی</span>
          </div>
        </button>

        {/* Tile 4: Personnel & Administrative Portal */}
        <button
          onClick={handleGoPortal}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 text-right cursor-pointer transition-all active:scale-95 space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">کارتابل اداری</span>
            <span className="text-[10px] text-slate-400">فیش، تردد و مرخصی</span>
          </div>
        </button>
      </div>

      {/* Holding Key Metrics Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            شاخص‌های کلیدی هلدینگ سیلانه سبز:
          </span>
          <span className="text-[10px] text-slate-400">به‌روزرسانی زنده</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">کل پرسنل فعال:</span>
            <span className="text-sm font-black text-slate-800 font-mono">
              {(metrics?.activeHeadcount ?? 1420).toLocaleString('fa-IR')} نفر
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">فرصت‌های باز:</span>
            <span className="text-sm font-black text-amber-600 font-mono">
              {metrics?.openPositionsCount ?? 14} ردیف
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">مرخصی معوقه:</span>
            <span className="text-sm font-black text-teal-700 font-mono">
              {metrics?.pendingLeavesCount ?? 9} درخواست
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">نرخ خروج (Turnover):</span>
            <span className="text-sm font-black text-emerald-600 font-mono">
              {metrics?.turnoverRatePct ?? 2.1}٪ (عالی)
            </span>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Automations Widget */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black text-slate-900">اتوماسیون‌های سریع (یک لمس)</span>
          </div>
          <button
            onClick={handleGoAutomations}
            className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {taskList.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  صرفه‌جویی: {task.estimatedTimeSaved}
                </span>
              </div>

              <button
                onClick={() => handleRun(task.id)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm flex-shrink-0"
              >
                <Zap className="w-3 h-3 fill-white" />
                <span>اجرا</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Iconic Brands of Seilaneh Sabz Holding Showcase */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs space-y-2">
        <span className="font-bold text-emerald-950 block">
          🌿 سبد برندهای ملی و بین‌المللی هلدینگ سیلانه سبز:
        </span>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-bold border border-emerald-200 shadow-xs">
            ✨ دافی (Dafi)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-bold border border-emerald-200 shadow-xs">
            ✨ کامان (Comeon)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-bold border border-emerald-200 shadow-xs">
            ✨ میس‌ویک (Misswake)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-bold border border-emerald-200 shadow-xs">
            ✨ زنون (Zenon)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-bold border border-emerald-200 shadow-xs">
            ✨ کاپوت (Kapoot)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-bold border border-emerald-200 shadow-xs">
            ✨ آمبرلا (Umbrella)
          </span>
        </div>
      </div>
    </div>
  );
};
