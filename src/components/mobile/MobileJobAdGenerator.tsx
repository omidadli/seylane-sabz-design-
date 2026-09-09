import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  FileText,
  Send,
  Loader2,
  PlusCircle,
  Briefcase,
  Building2,
  BookmarkPlus,
  HelpCircle,
  Coins,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { HoldingDepartment, JobAdGenerationRequest, JobAdGenerationResult } from '../../types';

interface MobileJobAdGeneratorProps {
  departments: HoldingDepartment[];
  initialDeptId?: string | null;
  onJobCreated?: (newJob: any) => void;
  onBack?: () => void;
}

export const MobileJobAdGenerator: React.FC<MobileJobAdGeneratorProps> = ({
  departments,
  initialDeptId,
  onJobCreated,
  onBack,
}) => {
  const [jobTitle, setJobTitle] = useState('مدیر برند (Brand Manager) - لاین مراقبت پوست');
  const [selectedDeptId, setSelectedDeptId] = useState(
    initialDeptId || departments[2]?.id || departments[0]?.id || 'dept-mkt'
  );

  // Sync when navigating here from a specific department (e.g. "تولید آگهی با AI")
  useEffect(() => {
    if (initialDeptId) {
      setSelectedDeptId(initialDeptId);
    }
  }, [initialDeptId]);
  const [seniority, setSeniority] = useState<'کارآموز' | 'کارشناس' | 'کارشناس ارشد' | 'سرپرست' | 'مدیر'>('مدیر');
  const [workType, setWorkType] = useState<'تمام‌وقت' | 'پاره‌وقت' | 'پروژه‌ای' | 'شیفتی کارخانه'>('تمام‌وقت');
  const [location, setLocation] = useState('تهران، خیابان ولیعصر (ستاد مرکزی هلدینگ)');
  const [brandFocus, setBrandFocus] = useState('دافی و کامان (Dafi & Comeon)');
  const [keySkills, setKeySkills] = useState('تحلیل بازار FMCG، استراتژی کمپین‌های ۳۶۰ درجه، هدایت تیم خلاقیت و روابط عمومی، بودجه‌ریزی برند');
  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    'پکیج ماهانه رایگان محصولات بهداشتی و آرایشی برندهای دافی و کامان',
    'بیمه تکمیلی درجه یک درمان برای پرسنل و خانواده',
    'پاداش عملکرد و بهره‌وری فصلی',
  ]);
  const [tone, setTone] = useState<'حرفه‌ای و سازمانی' | 'پرانرژی و استارتاپی' | 'کاریزماتیک و الهام‌بخش'>('پرانرژی و استارتاپی');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JobAdGenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'ad' | 'jd' | 'questions'>('ad');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const perksOptions = [
    'پکیج ماهانه رایگان محصولات بهداشتی و آرایشی برندهای دافی و کامان',
    'بیمه تکمیلی درجه یک درمان برای پرسنل و خانواده',
    'پاداش عملکرد و بهره‌وری فصلی',
    'سرویس ایاب و ذهاب از میادین اصلی تهران و کرج',
    'وعده غذایی گرم (صبحانه و ناهار سازمانی)',
    'وام و تسهیلات رفاهی قرض‌الحسنه سازمانی',
    'دوره آموزشی و سرتیفیکیت معتبر آکادمی سیلانه',
  ];

  const togglePerk = (perk: string) => {
    if (selectedPerks.includes(perk)) {
      setSelectedPerks(selectedPerks.filter((p) => p !== perk));
    } else {
      setSelectedPerks([...selectedPerks, perk]);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setSavedSuccess(false);

    const selectedDept = departments.find((d) => d.id === selectedDeptId);
    const departmentName = selectedDept ? selectedDept.name : 'مارکتینگ و برندها';

    const payload: JobAdGenerationRequest = {
      jobTitle,
      departmentId: selectedDeptId,
      departmentName,
      seniority,
      workType,
      location,
      brandFocus,
      keySkills,
      perks: selectedPerks,
      tone,
    };

    try {
      const res = await fetch('/api/ai/generate-job-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Job Ad generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSaveAsJob = () => {
    if (!result) return;
    const selectedDept = departments.find((d) => d.id === selectedDeptId);
    const newJob = {
      id: `job-${Date.now()}`,
      title: `${seniority} ${jobTitle}`,
      department: selectedDept ? selectedDept.name : 'دپارتمان هلدینگ سیلانه سبز',
      employmentType: workType,
      location,
      description: result.jobDescriptionMarkdown,
      requirements: keySkills,
      status: 'ACTIVE',
      createdAtJalali: '۱۴۰۳/۰۶/۱۵',
      applicationsCount: 0,
      criteria: [
        { id: 'c1', title: 'شایستگی‌های تخصصی نقش', weight: 40 },
        { id: 'c2', title: 'سابقه در صنعت FMCG و بهداشتی', weight: 35 },
        { id: 'c3', title: 'تطابق با فرهنگ سازمانی سیلانه سبز', weight: 25 },
      ],
    };

    if (onJobCreated) {
      onJobCreated(newJob);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center cursor-pointer hover:bg-white/25"
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <h1 className="text-sm sm:text-base font-black">
                  دستیار هوشمند تولید شرح شغل و آگهی استخدامی
                </h1>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                موتور هوش مصنوعی اختصاصی هلدینگ سیلانه سبز (پشتیبانی از دافی، کامان، میس‌ویک)
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <FileText className="w-5 h-5 text-emerald-200" />
          </div>
        </div>
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            مشخصات موقعیت شغلی مورد نظر:
          </span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
            تنظیم هوشمند با Gemini
          </span>
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            عنوان جایگاه شغلی:
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
            placeholder="مثال: سرپرست تولید کارخانه اشتهارد، مدیر برند دافی..."
          />
        </div>

        {/* Department & Brand Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              دپارتمان هلدینگ سیلانه سبز:
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              برند تحت پوشش هلدینگ:
            </label>
            <input
              type="text"
              value={brandFocus}
              onChange={(e) => setBrandFocus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
              placeholder="مثال: دافی (Dafi)، کامان، میس‌ویک..."
            />
          </div>
        </div>

        {/* Seniority, Work Type, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">سطح ارشدیت:</label>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
            >
              <option value="کارآموز">کارآموز (Intern)</option>
              <option value="کارشناس">کارشناس (Junior/Mid)</option>
              <option value="کارشناس ارشد">کارشناس ارشد (Senior)</option>
              <option value="سرپرست">سرپرست (Supervisor / Lead)</option>
              <option value="مدیر">مدیر دپارتمان (Manager / Head)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نوع همکاری:</label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
            >
              <option value="تمام‌وقت">تمام‌وقت (حضوری)</option>
              <option value="پاره‌وقت">پاره‌وقت / پروژه‌ای</option>
              <option value="شیفتی کارخانه">شیفتی چرخشی (کارخانه اشتهارد)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">لحن آگهی:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
            >
              <option value="پرانرژی و استارتاپی">پرانرژی و استارتاپی (شبکه‌های اجتماعی)</option>
              <option value="حرفه‌ای و سازمانی">حرفه‌ای و سازمانی (جابینجا / رسمی)</option>
              <option value="کاریزماتیک و الهام‌بخش">کاریزماتیک و رهبری (مدیران ارشد)</option>
            </select>
          </div>
        </div>

        {/* Key Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            مهارت‌های کلیدی و تجارب مورد انتظار:
          </label>
          <textarea
            rows={2}
            value={keySkills}
            onChange={(e) => setKeySkills(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
            placeholder="مهارت‌های فنی، سوابق مرتبط، مدارک تحصیلی یا نرم‌افزارهای تخصصی..."
          />
        </div>

        {/* Perks & Benefits Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              تسهیلات و مزایای ویژه هلدینگ سیلانه سبز:
            </span>
            <span className="text-[10px] text-slate-400">انتخاب موارد جذاب</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {perksOptions.map((perk, idx) => {
              const active = selectedPerks.includes(perk);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => togglePerk(perk)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 font-medium shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {perk}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !jobTitle}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>هوش مصنوعی در حال تدوین شرح شغل و آگهی استاندارد...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تولید آنی شرح شغل و آگهی استخدامی با هوش مصنوعی</span>
            </>
          )}
        </button>
      </div>

      {/* Generation Results View */}
      {result && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-md overflow-hidden animate-fadeIn">
          {/* Result Header Tabs */}
          <div className="bg-slate-50 p-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('ad')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ad'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📢 آگهی شبکه‌های اجتماعی
              </button>
              <button
                onClick={() => setActiveTab('jd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'jd'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📄 شرح شغل رسمی (JD)
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'questions'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎯 سوالات مصاحبه
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAsJob}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>به ردیف‌های شغلی افزوده شد!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>ثبت در فرصت‌های شغلی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Salary Benchmark Banner */}
          <div className="px-4 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>بازه حقوق پیشنهادی بازار کار ایران:</span>
              <span className="font-bold text-emerald-800">{result.salaryBenchmarkToman}</span>
            </div>
            <span className="text-[11px] text-slate-500">برند: {result.brandFocus}</span>
          </div>

          {/* Tab 1: Social Job Ad */}
          {activeTab === 'ad' && (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  متن آماده انتشار برای لینکدین، تلگرام و شبکه‌های استخدامی:
                </span>
                <button
                  onClick={() => handleCopy(result.recruitmentAdSocial, 'ad')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedType === 'ad' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی متن آگهی</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed font-sans whitespace-pre-wrap selection:bg-emerald-200">
                {result.recruitmentAdSocial}
              </div>
            </div>
          )}

          {/* Tab 2: Official Job Description */}
          {activeTab === 'jd' && (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  سند استاندارد شرح شغل سازمانی هلدینگ سیلانه سبز:
                </span>
                <button
                  onClick={() => handleCopy(result.jobDescriptionMarkdown, 'jd')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedType === 'jd' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی مارک‌داون</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {result.jobDescriptionMarkdown}
              </div>
            </div>
          )}

          {/* Tab 3: Interview Questions */}
          {activeTab === 'questions' && (
            <div className="p-4 sm:p-5 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                سوالات طلایی مصاحبه تخصصی و رفتاری (متدولوژی STAR):
              </span>
              <div className="space-y-2">
                {result.interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
