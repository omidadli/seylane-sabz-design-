import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../../types';
import {
  Search,
  Shield,
  Bot,
  FilePlus2,
  Menu,
  Building2,
  Calendar,
  Bell,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '../ui/theme';
import {
  getTodayJalali,
  JALALI_MONTH_NAMES,
  toPersianDigits,
} from '../../utils/jalali';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenVoiceAssistant?: () => void;
  onOpenJobGenerator?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleMobileSidebar?: () => void;
  activeModuleTitle?: string;
}

const roleOptions: { key: UserRole; shortLabel: string; fullLabel: string; desc: string }[] = [
  {
    key: UserRole.HR_DIRECTOR,
    shortLabel: 'مدیر ارشد HR',
    fullLabel: 'مدیر ارشد منابع انسانی',
    desc: 'دسترسی نامحدود مالی، حقوق و تنظیمات',
  },
  {
    key: UserRole.DEPT_MANAGER,
    shortLabel: 'مدیر واحد',
    fullLabel: 'مدیر دپارتمان / واحد',
    desc: 'تأیید تردد، مرخصی و ارزیابی شایستگی',
  },
  {
    key: UserRole.EMPLOYEE,
    shortLabel: 'همکار / پرسنل',
    fullLabel: 'همکار سازمانی',
    desc: 'مشاهده فیش، سوابق شخصی و درخواست‌ها',
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole = UserRole.HR_DIRECTOR,
  onRoleChange,
  onOpenVoiceAssistant,
  onOpenJobGenerator,
  onOpenCommandPalette,
  onToggleMobileSidebar,
  activeModuleTitle,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Compute Jalali "Today" formatted string
  const todayJalali = getTodayJalali();
  const weekDaysPersian = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const currentDayName = weekDaysPersian[new Date().getDay()];
  const jalaliDateStr = `${currentDayName}، ${toPersianDigits(todayJalali.day)} ${
    JALALI_MONTH_NAMES[todayJalali.month - 1]
  } ${toPersianDigits(todayJalali.year)}`;

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="app-header"
      dir="rtl"
      className="sticky top-0 z-40 h-16 bg-surface-1/90 backdrop-blur-md border-b border-border-default px-3 sm:px-6 transition-colors"
    >
      <div className="flex items-center justify-between gap-2.5 h-full max-w-7xl mx-auto w-full">
        {/* Right Section (RTL Start): Mobile Hamburger, Brand, and Breadcrumb/Page Title */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-[10px] text-text-2 hover:text-text-1 hover:bg-surface-2 lg:hidden cursor-pointer transition-colors"
              aria-label="منوی ماژول‌های سامانه"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-brand text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 select-none">
              کارا
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-text-1 tracking-tight">
                  سامانه کارا
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-brand-soft text-brand border border-brand/20 hidden sm:inline-block">
                  سیلانه سبز
                </span>
                {activeModuleTitle && (
                  <>
                    <span className="text-text-3 hidden md:inline">/</span>
                    <span className="text-xs font-bold text-text-2 hidden md:inline truncate max-w-44">
                      {activeModuleTitle}
                    </span>
                  </>
                )}
              </div>
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-text-3 font-medium">
                <Building2 className="w-3 h-3 text-text-3" />
                <span>دافی، کامان، میس‌ویک و کارخانجات اشتهارد</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Global Search Trigger (Ctrl+K / ⌘K) */}
        {onOpenCommandPalette && (
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="جستجوی سریع در سامانه با کلید میانبر کنترل K"
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-[10px] bg-surface-2 hover:bg-surface-3 border border-border-default text-text-3 hover:text-text-2 text-xs font-medium transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-text-3 group-hover:text-brand transition-colors shrink-0" aria-hidden="true" />
                <span className="truncate">جستجو در پرسنل، احکام، فیش‌ها...</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 mr-2" aria-hidden="true">
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-text-2 bg-surface-1 rounded-[6px] border border-border-default shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>
        )}

        {/* Left Section (RTL End): Jalali Date, Notifications, AI Triggers, Role Switcher & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Jalali "Today" Date Chip */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-surface-2 border border-border-default text-[11px] text-text-2 font-bold select-none"
            title="تقویم هجری خورشیدی رسمی ایران"
            aria-label={`تاریخ امروز: ${jalaliDateStr}`}
          >
            <Calendar className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{jalaliDateStr}</span>
          </div>

          {/* Quick AI Voice Trigger (Optional button) */}
          {onOpenVoiceAssistant && (
            <button
              type="button"
              onClick={onOpenVoiceAssistant}
              aria-label="دستیار هوشمند صوتی منابع انسانی (مدل هوش مصنوعی Gemini)"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-brand-soft hover:opacity-90 text-brand border border-brand/20 text-xs font-bold transition-all cursor-pointer"
              title="دستیار هوشمند صوتی منابع انسانی (Gemini)"
            >
              <Bot className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
              <span className="hidden 2xl:inline">دستیار صوتی</span>
            </button>
          )}

          {/* Quick Job Generator Trigger */}
          {onOpenJobGenerator && (
            <button
              type="button"
              onClick={onOpenJobGenerator}
              aria-label="تولید هوشمند شرح شغل با هوش مصنوعی"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-surface-2 hover:bg-surface-3 text-text-1 border border-border-default text-xs font-bold transition-all cursor-pointer"
              title="تولید هوشمند شرح شغل با AI"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-text-3" aria-hidden="true" />
              <span>آگهی شغل</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-haspopup="dialog"
              aria-expanded={isNotifOpen}
              className="relative p-2 rounded-[10px] text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer border border-transparent hover:border-border-default"
              title="اعلان‌های سیستمی و کارخانه"
              aria-label="اعلان‌های سیستمی (۳ اعلان خوانده نشده)"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {/* Notification Indicator Dot */}
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-brand ring-2 ring-surface-1" aria-hidden="true" />
            </button>

            {isNotifOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-surface-1 border border-border-default rounded-[14px] shadow-2xl p-3 z-50 animate-fadeIn text-right">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-default">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-brand" />
                    <span className="text-xs font-black text-text-1">اعلان‌های سامانه کارا</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-brand-soft text-brand">
                    ۳ مورد جدید
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2 rounded-[10px] bg-surface-2/80 border border-border-default flex items-start gap-2 text-right">
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-black text-text-1">تأیید تردد خط تولید کامان</div>
                      <div className="text-[10px] text-text-3 mt-0.5">
                        شیفت صبح کارخانه اشتهارد با موفقیت بسته و تأیید شد.
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-[10px] bg-surface-2/80 border border-border-default flex items-start gap-2 text-right">
                    <Sparkles className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-black text-text-1">غربالگری هوشمند ۵ رزومه</div>
                      <div className="text-[10px] text-text-3 mt-0.5">
                        موقعیت کارشناس ارشد فرمولاسیون دافی بررسی و امتیازدهی شد.
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-[10px] bg-surface-2/80 border border-border-default flex items-start gap-2 text-right">
                    <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-black text-text-1">یادآوری قراردادهای آزمایشی</div>
                      <div className="text-[10px] text-text-3 mt-0.5">
                        مهلت آزمایشی ۴ نفر از پرسنل اشتهارد در پایان هفته جاری خاتمه می‌یابد.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border-default text-center">
                  <span className="text-[10px] text-text-3 font-medium">
                    پایش لحظه‌ای هلدینگ سیلانه سبز
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Role Switcher Styled as Segmented Control */}
          <div
            className="flex items-center p-0.5 rounded-[10px] bg-surface-2 border border-border-default"
            role="group"
            aria-label="تغییر نقش کاربری"
          >
            {/* Desktop Full Segmented Control */}
            <div className="hidden md:flex items-center gap-0.5" role="radiogroup" aria-label="انتخاب نقش دسترسی">
              {roleOptions.map((opt) => {
                const isSelected = currentRole === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`نقش: ${opt.fullLabel}`}
                    onClick={() => onRoleChange?.(opt.key)}
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-black transition-all cursor-pointer select-none whitespace-nowrap ${
                      isSelected
                        ? 'bg-surface-1 text-brand shadow-xs border border-border-default'
                        : 'text-text-3 hover:text-text-1 hover:bg-surface-3/60'
                    }`}
                    title={`${opt.fullLabel} — ${opt.desc}`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Mobile / Tablet Compact Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                aria-label={`تغییر نقش کاربری، نقش فعلی: ${roleOptions.find((r) => r.key === currentRole)?.fullLabel || 'مدیر ارشد'}`}
                onClick={() => {
                  const currentIndex = roleOptions.findIndex((r) => r.key === currentRole);
                  const nextIndex = (currentIndex + 1) % roleOptions.length;
                  onRoleChange?.(roleOptions[nextIndex].key);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-[8px] bg-surface-1 text-brand text-xs font-black shadow-xs cursor-pointer border border-border-default"
                title="تغییر نقش با کلیک"
              >
                <Shield className="w-3 h-3 text-brand" aria-hidden="true" />
                <span className="text-[11px] whitespace-nowrap">
                  {roleOptions.find((r) => r.key === currentRole)?.shortLabel || 'مدیر ارشد'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
