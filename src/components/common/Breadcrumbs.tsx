import React from 'react';
import {
  ChevronLeft,
  Home,
} from 'lucide-react';
import { ModuleKey } from './Sidebar';
import { UserRole } from '../../types';

interface BreadcrumbsProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
  currentRole?: UserRole;
  isPwaPortalMode?: boolean;
  onTogglePwaPortalMode?: () => void;
}

const moduleTitles: Record<ModuleKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'پیشخوان هوشمند', subtitle: 'پایش لحظه‌ای و نمای ۳۶۰ درجه هلدینگ' },
  'ai-governance': { title: 'مدیریت و حاکمیت هوش مصنوعی', subtitle: 'پیکربندی رفتار بات، فرهنگ سازمانی، پایپ‌لاین دپارتمان‌ها و اتصال Gemini' },
  recruitment: { title: 'جذب و استخدام', subtitle: 'کانبان، رزومه‌ها، ارزیابی هوش مصنوعی و مصاحبه‌ها' },
  employees: { title: 'پرونده پرسنلی', subtitle: 'احکام کارگزینی، مشخصات همکاران و چارت سازمانی' },
  attendance: { title: 'تردد و مرخصی‌ها', subtitle: 'ثبت ورود/خروج کارخانجات اشتهارد و سقف ۲۶ روزه' },
  payroll: { title: 'حقوق و دستمزد', subtitle: 'صدور فیش بر مبنای بخشنامه سال، بیمه ۷٪ و مالیات پله‌ای' },
  performance: { title: 'مدیریت عملکرد', subtitle: 'اهداف فصلی OKR، ارزیابی شایستگی و بازخورد' },
  training: { title: 'آموزش و مهارت‌ها', subtitle: 'دوره‌های سازمانی، استانداردهای GMP و ماتریس مهارت' },
  checklists: { title: 'ورود و خروج همکاران', subtitle: 'چک‌لیست‌های ان‌بوردینگ و تسویه‌حساب مرحله‌ای' },
  analytics: { title: 'داشبورد و گزارشات', subtitle: 'شاخص‌های کلیدی منابع انسانی (HR KPI)' },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const current = moduleTitles[activeModule] || moduleTitles.dashboard;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 mb-5 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Breadcrumbs Trail & Module Title */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
          <button
            type="button"
            onClick={() => onSelectModule('dashboard')}
            className="flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>سامانه کارا</span>
          </button>
          <ChevronLeft className="w-3 h-3 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-700 dark:text-slate-300 font-bold">{current.title}</span>
        </nav>
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {current.title}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
            — {current.subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};
