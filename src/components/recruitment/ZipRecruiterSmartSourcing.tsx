/**
 * سامانه جذب هوشمند، انتشار همزمان و غربالگری سریع (الهام‌گرفته از ZipRecruiter با کاربری فوق‌العاده سریع)
 * AI Smart Sourcing ("Phil" Assistant), 1-Click "Invite to Apply", Multi-Channel Syndication & Knockout Questions
 */

import React, { useState, useEffect } from 'react';
import {
  SourcedCandidate,
  JobSyndicationChannel,
  KnockoutQuestion,
  JobPosting,
} from '../../types';
import { toPersianDigits, formatToman } from '../../utils/jalali';
import { showToast } from '../common/Toast';
import {
  Zap,
  Send,
  Share2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Filter,
  Eye,
  MousePointer,
  Users,
  Building2,
  Briefcase,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  BadgeAlert,
  MessageSquare,
} from 'lucide-react';

interface ZipRecruiterSmartSourcingProps {
  jobs: JobPosting[];
  activeJobId: string;
}

export const ZipRecruiterSmartSourcing: React.FC<ZipRecruiterSmartSourcingProps> = ({
  jobs,
  activeJobId,
}) => {
  const [activeTab, setActiveTab] = useState<'sourcing' | 'syndication' | 'knockout'>('sourcing');
  const [sourcedList, setSourcedList] = useState<SourcedCandidate[]>([]);
  const [channels, setChannels] = useState<JobSyndicationChannel[]>([]);
  const [knockoutList, setKnockoutList] = useState<KnockoutQuestion[]>([]);
  const [selectedCandidateForInvite, setSelectedCandidateForInvite] = useState<SourcedCandidate | null>(null);
  const [inviteCustomText, setInviteCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New knockout question modal
  const [isAddingKq, setIsAddingKq] = useState(false);
  const [newKqText, setNewKqText] = useState('');
  const [newKqExplanation, setNewKqExplanation] = useState('');

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [srcRes, synRes, kqRes] = await Promise.all([
        fetch('/api/competitor/ziprecruiter/sourced-candidates').then((r) => r.json()),
        fetch('/api/competitor/ziprecruiter/syndication').then((r) => r.json()),
        fetch('/api/competitor/ziprecruiter/knockout-questions').then((r) => r.json()),
      ]);
      setSourcedList(srcRes || []);
      setChannels(synRes || []);
      setKnockoutList(kqRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInvite = (candidate: SourcedCandidate) => {
    setSelectedCandidateForInvite(candidate);
    setInviteCustomText(
      `جناب/سرکار ${candidate.fullName} عزیز، سوابق درخشان شما در شرکت ${candidate.currentCompany} توجه تیم منابع انسانی هلدینگ سیلانه سبز (برندهای دافی، کامان، میس‌ویک و کاپوت) را جلب کرده است. مایلیم شما را به بررسی فرصت شغلی «${activeJob?.title || 'کارشناس ارشد'}» دعوت کنیم.`
    );
  };

  const handleSendInvite = async () => {
    if (!selectedCandidateForInvite) return;
    try {
      const res = await fetch('/api/competitor/ziprecruiter/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: selectedCandidateForInvite.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSourcedList((prev) =>
          prev.map((c) =>
            c.id === selectedCandidateForInvite.id
              ? { ...c, status: 'INVITED', invitedAtJalali: 'امروز - لحظاتی پیش' }
              : c
          )
        );
        showToast(
          `دعوت‌نامه اختصاصی هلدینگ سیلانه سبز برای ${selectedCandidateForInvite.fullName} ارسال شد`,
          'success'
        );
        setSelectedCandidateForInvite(null);
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در ارسال دعوت‌نامه', 'error');
    }
  };

  const handleToggleChannel = async (channel: JobSyndicationChannel) => {
    const nextStatus = channel.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch('/api/competitor/ziprecruiter/toggle-syndication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channel.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setChannels((prev) =>
          prev.map((c) => (c.id === channel.id ? data.channel : c))
        );
        showToast(
          `وضعیت انتشار در پلتفرم ${channel.platformName} به روزرسانی شد`,
          'info'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در تغییر وضعیت کانال انتشار', 'error');
    }
  };

  const handleAddKnockout = async () => {
    if (!newKqText.trim()) return;
    try {
      const res = await fetch('/api/competitor/ziprecruiter/knockout-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newKqText,
          requiredAnswer: true,
          isDealBreaker: true,
          explanation: newKqExplanation || 'الزام موقعیت شغلی کارخانجات سیلانه سبز',
        }),
      });
      const newKq = await res.json();
      setKnockoutList((prev) => [...prev, newKq]);
      setNewKqText('');
      setNewKqExplanation('');
      setIsAddingKq(false);
      showToast('سوال حذفی جدید با موفقیت به فرآیند غربالگری اضافه شد', 'success');
    } catch (err) {
      console.error(err);
      showToast('خطا در ذخیره سوال حذفی', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-7 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-emerald-300" />
              <span>موتور جذب هوشمند و انتشار چندکاناله (ZipRecruiter Smart Benchmark)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              سورسینگ آنی استعدادهای برتر، دعوت با ۱ کلیک و انتشار همزمان
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              با الهام از الگوریتم هوشمند ZipRecruiter، کارجویان برتر خارج از سازمان شناسایی شده، با ۱ کلیک دعوت‌نامه
              دریافت می‌کنند و آگهی استخدام با یک لمس در جابینجا، جاب‌ویژن، ایران‌تلنت و لینکدین منتشر می‌گردد.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('sourcing')}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'sourcing'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>استعدادهای شکارشده (AI Sourcing)</span>
            </button>
            <button
              onClick={() => setActiveTab('syndication')}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'syndication'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>انتشار همزمان آگهی</span>
            </button>
            <button
              onClick={() => setActiveTab('knockout')}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'knockout'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4 shrink-0" />
              <span>سوالات حذفی غربالگری</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: AI Smart Sourcing ("Phil" Assistant) */}
      {activeTab === 'sourcing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>پیشنهادات هوشمند منطبق بر موقعیت «{activeJob?.title || 'موقعیت فعال'}»</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                استعدادهای کلیدی بازار که هنوز رزومه نفرستاده‌اند اما صلاحیت بیش از ۸۵٪ دارند
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {toPersianDigits(sourcedList.length)} استعداد برتر شناسایی‌شده
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sourcedList.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-700 text-sm">
                        {cand.fullName.split(' ')[0][0]}
                        {cand.fullName.split(' ')[1]?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{cand.fullName}</div>
                        <div className="text-xs text-slate-500">{cand.currentRole}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-600">
                        {toPersianDigits(cand.matchScorePct)}٪
                      </div>
                      <span className="text-[10px] text-slate-400 block">انطباق آنی</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>شرکت فعلی:</span>
                      <span className="font-bold text-slate-900">{cand.currentCompany}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>سابقه کار تخصصی:</span>
                      <span className="font-bold text-slate-900">{toPersianDigits(cand.experienceYears)} سال</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>سکونت:</span>
                      <span className="font-bold text-slate-900">{cand.location}</span>
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {cand.topSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">{cand.lastActive}</span>

                  {cand.status === 'INVITED' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>دعوت‌شده ({cand.invitedAtJalali})</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenInvite(cand)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>دعوت به همکاری (۱ کلیک)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Channel Job Syndication */}
      {activeTab === 'syndication' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                وضعیت انتشار همزمان در بسترهای برتر کاریابی (Multi-Job Board Syndication)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مدیریت متمرکز آگهی‌های هلدینگ سیلانه سبز در سایت‌های معتبر ایران
              </p>
            </div>
            <div className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              کل رزومه‌های ورودی جذب همزمان: ۲۷۱ نفر
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((chan) => {
              const isActive = chan.status === 'ACTIVE';
              return (
                <div
                  key={chan.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{chan.platformLogo}</span>
                        <div>
                          <div className="text-sm font-black text-slate-900">{chan.platformName}</div>
                          <div className="text-[11px] text-slate-400">همگام‌سازی: {chan.lastSyncJalali}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleChannel(chan)}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{isActive ? 'فعال و منتشر' : 'متوقف‌شده'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          <span>بازدید</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 mt-1">
                          {toPersianDigits(chan.impressionsCount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5">
                          <MousePointer className="w-3 h-3" />
                          <span>کلیک</span>
                        </div>
                        <div className="text-xs font-black text-slate-900 mt-1">
                          {toPersianDigits(chan.clicksCount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-0.5">
                          <Users className="w-3 h-3" />
                          <span>رزومه</span>
                        </div>
                        <div className="text-xs font-black text-emerald-700 mt-1">
                          {toPersianDigits(chan.applicationsReceived)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      هزینه درج آگهی: {formatToman(chan.costToman)} تومان
                    </span>
                    <button
                      onClick={() => showToast(`لینک آگهی در ${chan.platformName} کپی شد`, 'info')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>مشاهده در سایت</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Knockout Questions & Screening */}
      {activeTab === 'knockout' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                سوالات حذفی و غربالگری خودکار (Knockout Pre-screening Rules)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                رزومه‌هایی که به این شروط الزامی پاسخ منفی دهند به صورت خودکار به مرحله عدم تایید اولیه منتقل می‌شوند
              </p>
            </div>
            <button
              onClick={() => setIsAddingKq(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن شرط حذفی جدید</span>
            </button>
          </div>

          <div className="space-y-3">
            {knockoutList.map((kq, idx) => (
              <div
                key={kq.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
                      شرط حذفی الزامی (Deal-Breaker)
                    </span>
                    <span className="text-xs font-bold text-slate-900">{kq.question}</span>
                  </div>
                  <p className="text-xs text-slate-500">{kq.explanation}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    پاسخ مجاز: تایید کامل
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Modal */}
          {isAddingKq && (
            <div className="p-5 rounded-3xl bg-slate-50 border border-emerald-300 space-y-4 animate-in fade-in">
              <div className="text-sm font-black text-slate-900">تعریف سوال حذفی جدید</div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">متن سوال غربالگری:</label>
                  <input
                    type="text"
                    value={newKqText}
                    onChange={(e) => setNewKqText(e.target.value)}
                    placeholder="مثال: آیا دارای سابقه کار در کارخانجات دارویی یا آرایشی بهداشتی هستید؟"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">علت و الزام قانونی/سازمانی:</label>
                  <input
                    type="text"
                    value={newKqExplanation}
                    onChange={(e) => setNewKqExplanation(e.target.value)}
                    placeholder="الزام استانداردهای GMP و مقررات سازمان غذا و دارو"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsAddingKq(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 bg-white border border-slate-200"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAddKnockout}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  افزودن و فعال‌سازی
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal (1-Click Invite to Apply) */}
      {selectedCandidateForInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Send className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  ارسال دعوت‌نامه استخدامی به {selectedCandidateForInvite.fullName}
                </h4>
              </div>
              <button
                onClick={() => setSelectedCandidateForInvite(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              این پیام از طریق پیامک رسمی و ایمیل سازمانی هلدینگ سیلانه سبز همراه با لینک ویژه ثبت‌نام بدون نیاز به پر کردن فرم‌های تکراری برای کارجو ارسال خواهد شد:
            </p>

            <textarea
              value={inviteCustomText}
              onChange={(e) => setInviteCustomText(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-700 font-bold">
                تطابق پیش‌بینی‌شده: {toPersianDigits(selectedCandidateForInvite.matchScorePct)}٪
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCandidateForInvite(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSendInvite}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال فوری دعوت‌نامه</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
