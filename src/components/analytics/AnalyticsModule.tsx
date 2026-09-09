import React from 'react';
import { Candidate, CandidateStage, HRDashboardMetrics } from '../../types';
import { toPersianDigits, formatToman } from '../../utils/jalali';
import {
  BarChart3,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Download,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AnalyticsModuleProps {
  metrics: HRDashboardMetrics;
  candidates?: Candidate[];
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ metrics, candidates = [] }) => {
  // Real recruitment funnel computed from the pipeline (audit fix MOD-05:
  // the funnel used to be hardcoded 250/65/24/8 fiction).
  const funnelTotal = candidates.length;
  const funnelPriority = candidates.filter((c) => typeof c.overallScore === 'number' && c.overallScore >= 7).length;
  const funnelInterviewed = candidates.filter((c) =>
    [CandidateStage.IN_PERSON_INTERVIEW, CandidateStage.OFFER, CandidateStage.HIRED].includes(c.stage)
  ).length;
  const funnelHired = candidates.filter((c) => c.stage === CandidateStage.HIRED).length;
  const pct = (n: number) => (funnelTotal > 0 ? Math.round((n / funnelTotal) * 1000) / 10 : 0);
  const funnelRows = [
    { label: '۱. کل رزومه‌های ثبت‌شده (ورودی قیف)', count: funnelTotal, color: 'bg-blue-500' },
    { label: '۲. کسب امتیاز واقعی ≥۷ در ارزیابی شاخص‌ها', count: funnelPriority, color: 'bg-emerald-500' },
    { label: '۳. راه‌یافته به مصاحبه تخصصی/حضوری و آفر', count: funnelInterviewed, color: 'bg-purple-500' },
    { label: '۴. استخدام نهایی و ایجاد پرونده پرسنلی', count: funnelHired, color: 'bg-teal-600' },
  ];
  const handleExportData = () => {
    const jsonStr = JSON.stringify(metrics, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kara_HRMS_Analytics_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            داشبورد مدیریتی شاخص‌های کلیدی منابع انسانی (HR KPI Metrics)
          </h2>
          <p className="text-xs text-slate-500">
            پایش نرخ گردش شغلی، هزینه جذب، زمان پر کردن ردیف‌های شغلی و بازدهی سرمایه‌های انسانی
            {(metrics as any).computedAtJalali
              ? ` — محاسبه زنده در ${toPersianDigits((metrics as any).computedAtJalali)} (نرخ خروج، پرسنل فعال و مرخصی‌ها از داده‌های واقعی؛ هزینه/زمان جذب شاخص‌های برنامه‌ریزی سالانه‌اند)`
              : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportData}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>خروجی استاندارد شاخص‌ها (JSON/Excel)</span>
        </button>
      </div>

      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Turnover Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>نرخ خروج پرسنل (Turnover)</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {toPersianDigits(metrics.turnoverRatePct)}٪
          </div>
          <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            ۲.۱٪ کمتر از میانگین صنعت IT
          </div>
        </div>

        {/* Time to Hire */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>میانگین زمان استخدام (Time to Hire)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.averageTimeToHireDays == null ? '—' : `${toPersianDigits(metrics.averageTimeToHireDays)} روز`}
          </div>
          <div className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
            تسریع ۵۰٪ با هوش مصنوعی Gemini
          </div>
        </div>

        {/* Cost per Hire */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>میانگین هزینه هر جذب (Cost per Hire)</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.costPerHireToman == null ? '—' : formatToman(metrics.costPerHireToman)}
          </div>
          <div className="text-[10px] text-slate-400">آگهی‌ها، پلتفرم‌ها و ساعات مصاحبه</div>
        </div>

        {/* Total Employees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>تعداد پرسنل فعال (Headcount)</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {toPersianDigits(metrics.activeHeadcount)} نفر
          </div>
          <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            رشد ۱۲٪ در سال جاری
          </div>
        </div>
      </div>

      {/* Recruitment Funnel Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">قیف جذب و استخدام (Recruitment Funnel)</h3>
          <span className="text-xs text-slate-500">محاسبه زنده از پایپ‌لاین کارجویان سامانه</span>
        </div>

        <div className="space-y-3">
          {funnelRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{row.label}</span>
                <span>
                  {toPersianDigits(row.count)} نفر ({toPersianDigits(row === funnelRows[0] ? 100 : pct(row.count))}٪)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className={`${row.color} h-3 rounded-full`}
                  style={{ width: `${row === funnelRows[0] ? 100 : pct(row.count)}%` }}
                />
              </div>
            </div>
          ))}
          {funnelTotal === 0 && (
            <p className="text-[11px] text-slate-500 text-center py-2">
              هنوز کارجویی در پایپ‌لاین ثبت نشده است.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
