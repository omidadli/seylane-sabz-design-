import React, { useState, useRef } from 'react';
import { JobPosting } from '../../types';
import { toPersianDigits } from '../../utils/jalali';
import JSZip from 'jszip';
import { extractResumeText } from '../../utils/resumeTextExtraction';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Loader2,
  FolderArchive,
  Plus,
  Trash2,
  Building2,
  MapPin,
  Check,
  ChevronDown,
  Layers,
  FileCode,
} from 'lucide-react';

export interface StagedResumeFile {
  id: string;
  name: string;
  size: number;
  type: string;
  sourceZip?: string;
  text?: string;
  extracting?: boolean;
  extractionError?: string;
}

// All holding departments across Seilaneh Sabz (Plants, R&D, Brands, Sales, SCM, etc.)
export const ALL_SEILANEH_DEPARTMENTS = [
  'کارخانجات و صنایع تولیدی اشتهارد و سیمین‌دشت',
  'لابراتوارهای تحقیق، توسعه و فرمولاسیون (R&D)',
  'کنترل کیفیت و تضمین کیفیت (QA & QC)',
  'مارکتینگ، روابط عمومی و مدیریت برندها (PR & Brands)',
  'فروش سراسری، زنجیره‌ای و توزیع مویرگی (FMCG Sales)',
  'زنجیره تامین، بازرگانی خارجی و لجستیک (Supply Chain)',
  'مدیریت منابع انسانی، آموزش و فرهنگ سازمانی',
  'امور مالی، بهای تمام‌شده و حسابداری صنعتی',
  'فناوری اطلاعات، زیرساخت و تحول دیجیتال',
  'امور حقوقی، قراردادها و رگولاتوری غذا و دارو',
  'مهندسی، تاسیسات و نگهداری و تعمیرات (نت صنعتی - PM)',
  'بهداشت، ایمنی و محیط زیست (HSE کارخانجات)',
  'خدمات مشتریان، امور نمایندگی‌ها و صدای مشتری (CRM)',
];

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobPosting[];
  activeJobId: string;
  onUploadComplete: (result: any) => void;
  onJobCreated?: (newJob: JobPosting) => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  jobs: initialJobs,
  activeJobId,
  onUploadComplete,
  onJobCreated,
}) => {
  const [localJobs, setLocalJobs] = useState<JobPosting[]>(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState(activeJobId || initialJobs[0]?.id || 'job-1');

  // File states
  const [stagedFiles, setStagedFiles] = useState<StagedResumeFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtractingZip, setIsExtractingZip] = useState(false);
  const [zipMessage, setZipMessage] = useState<{ name: string; count: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStageText, setProgressStageText] = useState('');

  // Inline New Job Creation State
  const [isAddingNewJob, setIsAddingNewJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState(ALL_SEILANEH_DEPARTMENTS[0]);
  const [newJobType, setNewJobType] = useState('تمام‌وقت');
  const [newJobLocation, setNewJobLocation] = useState('البرز، شهرک صنعتی اشتهارد');
  const [isCreatingJobSubmitting, setIsCreatingJobSubmitting] = useState(false);

  // Results State
  const [processedStats, setProcessedStats] = useState<{
    total: number;
    priority: number;
    review: number;
    rejected: number;
    sampleCandidates?: any[];
  } | null>(null);

  // Refs for file inputs
  const manualFileInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '۰ بایت';
    const k = 1024;
    if (bytes < k) return `${toPersianDigits(bytes)} بایت`;
    if (bytes < k * k) return `${toPersianDigits(Math.round(bytes / k))} کیلوبایت`;
    return `${toPersianDigits((bytes / (k * k)).toFixed(1))} مگابایت`;
  };

  // Group jobs by department
  const groupedJobs = localJobs.reduce((acc, job) => {
    const dept = job.department || 'سایر واحدها';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(job);
    return acc;
  }, {} as Record<string, JobPosting[]>);

  // Handle Quick Job Creation inside Modal
  const handleCreateNewJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    setIsCreatingJobSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newJobTitle.trim(),
          department: newJobDept,
          employmentType: newJobType,
          location: newJobLocation,
          description: `موقعیت شغلی استخدامی برای دپارتمان ${newJobDept} در هلدینگ سیلانه سبز.`,
          requirements: 'تسلط بر شایستگی‌های عمومی و تخصصی متناسب با شاخص‌های کیفیت و عملکرد هلدینگ.',
          criteria: [
            { id: `c-${Date.now()}-1`, title: 'شایستگی و تخصص فنی', weight: 40 },
            { id: `c-${Date.now()}-2`, title: 'سابقه کار و پروژه‌های مرتبط', weight: 35 },
            { id: `c-${Date.now()}-3`, title: 'روحیه کار تیمی و مهارت‌های ارتباطی', weight: 25 },
          ],
        }),
      });

      const created: JobPosting = await res.json();
      setLocalJobs((prev) => [created, ...prev]);
      setSelectedJobId(created.id);
      if (onJobCreated) {
        onJobCreated(created);
      }
      setIsAddingNewJob(false);
      setNewJobTitle('');
    } catch (err) {
      console.error('Error creating job:', err);
    } finally {
      setIsCreatingJobSubmitting(false);
    }
  };

  // Unpack and extract files from a ZIP archive using JSZip
  const handleExtractZip = async (zipFile: File) => {
    setIsExtractingZip(true);
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipFile);

      const extracted: StagedResumeFile[] = [];

      for (const [relativePath, entry] of Object.entries(loadedZip.files)) {
        if (entry.dir) continue;
        if (
          relativePath.startsWith('__MACOSX') ||
          relativePath.includes('/.') ||
          relativePath.endsWith('.DS_Store') ||
          relativePath.endsWith('Thumbs.db')
        ) {
          continue;
        }

        const fileName = relativePath.split('/').pop() || relativePath;
        const ext = fileName.split('.').pop()?.toLowerCase() || '';

        if (!['pdf', 'docx', 'doc', 'txt', 'md', 'json', 'csv', 'rtf'].includes(ext)) {
          continue;
        }

        const blob = await entry.async('blob');
        const extraction = await extractResumeText(blob, fileName);

        extracted.push({
          id: `zip-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: fileName,
          size: blob.size,
          type: ext || 'pdf',
          sourceZip: zipFile.name,
          text: extraction.success ? extraction.text : undefined,
          extractionError: extraction.success ? undefined : extraction.error,
        });
      }

      if (extracted.length > 0) {
        setStagedFiles((prev) => [...extracted, ...prev]);
        setZipMessage({ name: zipFile.name, count: extracted.length });
      } else {
        alert('فایل فشرده خالی است یا فایل رزومه معتبری در آن یافت نشد.');
      }
    } catch (err) {
      console.error('Failed to unpack zip:', err);
      alert('خطا در اکسترکت فایل فشرده ZIP. لطفاً از سالم بودن فایل اطمینان حاصل فرمایید.');
    } finally {
      setIsExtractingZip(false);
    }
  };

  // Handle files (manual selection or drag-drop)
  const processIncomingFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const regularFiles: File[] = [];
    const zipFiles: File[] = [];

    filesArray.forEach((file) => {
      const isZip =
        file.name.toLowerCase().endsWith('.zip') ||
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed';
      (isZip ? zipFiles : regularFiles).push(file);
    });

    if (regularFiles.length > 0) {
      const placeholders: StagedResumeFile[] = regularFiles.map((file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop()?.toLowerCase() || 'pdf',
        extracting: true,
      }));
      setStagedFiles((prev) => [...placeholders, ...prev]);

      await Promise.all(
        regularFiles.map(async (file, idx) => {
          const extraction = await extractResumeText(file, file.name);
          setStagedFiles((prev) =>
            prev.map((f) =>
              f.id === placeholders[idx].id
                ? {
                    ...f,
                    extracting: false,
                    text: extraction.success ? extraction.text : undefined,
                    extractionError: extraction.success ? undefined : extraction.error,
                  }
                : f
            )
          );
        })
      );
    }

    zipFiles.forEach((zipFile) => {
      handleExtractZip(zipFile);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAllFiles = () => {
    setStagedFiles([]);
    setZipMessage(null);
  };

  const handleStartBulkProcessing = async () => {
    setUploadError(null);
    const readyFiles = stagedFiles.filter((f) => !f.extracting && f.text && f.text.trim().length >= 30);
    const failedFiles = stagedFiles.filter((f) => !f.extracting && (!f.text || f.text.trim().length < 30));

    if (readyFiles.length === 0) {
      setUploadError(
        'هیچ رزومه‌ای با متن قابل‌استخراج وجود ندارد. لطفاً فایل PDF/Word متنی (نه اسکن تصویری) آپلود کنید.' +
          (failedFiles.length > 0 ? ` (${toPersianDigits(failedFiles.length)} فایل بدون متن قابل استخراج)` : '')
      );
      return;
    }

    if (failedFiles.length > 0) {
      const proceed = confirm(
        `متن ${toPersianDigits(failedFiles.length)} فایل قابل استخراج نبود و از فرآیند ارزیابی کنار گذاشته می‌شود (مثلاً اسکن تصویری). ادامه با ${toPersianDigits(readyFiles.length)} رزومه معتبر؟`
      );
      if (!proceed) return;
    }

    setIsProcessing(true);
    setProgress(5);
    setProgressStageText('در حال ارسال رزومه‌ها برای ارزیابی واقعی...');
    setProcessedStats(null);

    const stages = [
      { p: 25, text: 'تحلیل شاخصه‌های شغلی و آماده‌سازی رزومه‌ها برای ارزیابی...' },
      { p: 55, text: 'ارزیابی هوشمند شایستگی‌ها و تطبیق با الزامات موقعیت شغلی...' },
      { p: 85, text: 'محاسبه امتیاز نهایی، رتبه‌بندی اولویت‌ها و تولید بازخوردهای غربالگری...' },
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        const next = prev + Math.floor(Math.random() * 12) + 6;
        if (stageIdx < stages.length && next >= stages[stageIdx].p) {
          setProgressStageText(stages[stageIdx].text);
          stageIdx++;
        }
        return next;
      });
    }, 200);

    const actualCountToProcess = readyFiles.length;

    try {
      const res = await fetch('/api/candidates/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          files: readyFiles.map((f) => ({
            name: f.name,
            size: f.size,
            text: f.text,
            sourceZip: f.sourceZip,
          })),
        }),
      });
      clearInterval(interval);

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setProgress(0);
        setUploadError(
          data?.error ||
            'ثبت رزومه‌ها ناموفق بود' +
              (data?.skipped?.length ? ` (${toPersianDigits(data.skipped.length)} فایل بدون متن)` : '')
        );
        return;
      }

      setProgress(100);
      setProgressStageText('ثبت رزومه‌های واقعی با موفقیت انجام شد.');
      setProcessedStats({
        total: data.processedCount ?? actualCountToProcess,
        priority: data.interviewPriorityCount ?? 0,
        review: data.needsReviewCount ?? 0,
        rejected: data.initialRejectionCount ?? 0,
        sampleCandidates: data.sampleCandidates || [],
      });

      onUploadComplete(data);
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setUploadError(err?.message || 'خطای شبکه در ارسال فایل‌ها به سرور');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedJob = localJobs.find((j) => j.id === selectedJobId) || localJobs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-surface-1 rounded-[16px] max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-border-default my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-brand-soft text-brand flex items-center justify-center font-bold shadow-2xs border border-brand/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-1 flex items-center gap-2">
                <span>بارگذاری گروهی رزومه‌ها و اکسترکت خودکار ZIP</span>
                <span className="text-[10px] bg-brand-soft text-brand font-bold px-2 py-0.5 rounded-md border border-brand/20">
                  سیلانه سبز
                </span>
              </h3>
              <p className="text-xs text-text-3 mt-0.5">
                پشتیبانی از فایل‌های PDF، Word و بازگشایی آرشیو فشرده ZIP جهت ارزیابی هوشمند
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="p-1.5 text-text-3 hover:text-text-1 hover:bg-surface-2 rounded-[10px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Destination Job Section */}
          <div className="bg-surface-2 p-3.5 rounded-[12px] border border-border-default space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand" />
                <span>موقعیت شغلی مقصد:</span>
              </label>

              {!isAddingNewJob && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsAddingNewJob(true)}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن موقعیت شغلی جدید</span>
                </button>
              )}
            </div>

            {!isAddingNewJob ? (
              <div className="space-y-1.5">
                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW_JOB__') {
                        setIsAddingNewJob(true);
                      } else {
                        setSelectedJobId(e.target.value);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface-1 border border-border-default rounded-[10px] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium text-text-1 shadow-2xs cursor-pointer appearance-none pl-8"
                  >
                    {ALL_SEILANEH_DEPARTMENTS.map((deptName) => {
                      const deptJobs = groupedJobs[deptName] || [];
                      return (
                        <optgroup key={deptName} label={`🏢 ${deptName}`}>
                          {deptJobs.length > 0 ? (
                            deptJobs.map((j) => (
                              <option key={j.id} value={j.id}>
                                {j.title} — ({j.location} • {j.employmentType})
                              </option>
                            ))
                          ) : (
                            <option disabled value={`empty-${deptName}`}>
                              (ردیف شغلی باز در این دپارتمان تعریف نشده است)
                            </option>
                          )}
                        </optgroup>
                      );
                    })}

                    {Object.keys(groupedJobs)
                      .filter((dept) => !ALL_SEILANEH_DEPARTMENTS.includes(dept))
                      .map((dept) => (
                        <optgroup key={dept} label={`🏢 ${dept}`}>
                          {groupedJobs[dept].map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.title} — ({j.location} • {j.employmentType})
                            </option>
                          ))}
                        </optgroup>
                      ))}

                    <option
                      value="__CREATE_NEW_JOB__"
                      className="font-bold text-brand bg-brand-soft py-1"
                    >
                      ➕ + تعریف موقعیت شغلی جدید...
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-3 absolute left-3 top-3 pointer-events-none" />
                </div>

                {selectedJob && (
                  <div className="flex items-center gap-2.5 text-[11px] text-text-3 px-1">
                    <span className="flex items-center gap-1 text-text-2 font-medium">
                      <Layers className="w-3.5 h-3.5 text-brand" />
                      <span>{selectedJob.department}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-text-3" />
                      <span>{selectedJob.location}</span>
                    </span>
                    <span>•</span>
                    <span>{selectedJob.employmentType}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Inline Form for Adding New Job Position */
              <form
                onSubmit={handleCreateNewJob}
                className="bg-surface-1 p-3.5 rounded-[10px] border border-brand/40 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border-default text-xs font-bold text-brand">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>تعریف ردیف شغلی جدید</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewJob(false)}
                    className="text-text-3 hover:text-text-1 p-0.5 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-2 mb-1">
                      عنوان موقعیت شغلی <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="مثلاً: کارشناس فرمولاسیون آرایشی دافی"
                      className="w-full px-3 py-1.5 text-xs bg-surface-2 border border-border-default rounded-[8px] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-text-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-2 mb-1">
                      دپارتمان سازمانی
                    </label>
                    <select
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface-2 border border-border-default rounded-[8px] focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-1"
                    >
                      {ALL_SEILANEH_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-2 mb-1">
                      نوع همکاری
                    </label>
                    <select
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface-2 border border-border-default rounded-[8px] focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-1"
                    >
                      <option value="تمام‌وقت">تمام‌وقت</option>
                      <option value="۳ نوبت کاری چرخشی">۳ نوبت کاری چرخشی (کارخانجات)</option>
                      <option value="پاره‌وقت">پاره‌وقت</option>
                      <option value="پروژه‌ای / قراردادی">پروژه‌ای / قراردادی</option>
                      <option value="دورکاری / هیبریدی">دورکاری / هیبریدی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-2 mb-1">
                      محل خدمت
                    </label>
                    <select
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface-2 border border-border-default rounded-[8px] focus:outline-none focus:ring-2 focus:ring-brand/30 text-text-1"
                    >
                      <option value="البرز، شهرک صنعتی اشتهارد">البرز، شهرک صنعتی اشتهارد (کارخانجات)</option>
                      <option value="البرز، شهرک صنعتی سیمین‌دشت">البرز، شهرک صنعتی سیمین‌دشت</option>
                      <option value="ستاد مرکزی تهران، خیابان ولیعصر">ستاد مرکزی تهران، خیابان ولیعصر</option>
                      <option value="انبار مکانیزه مرکزی شورآباد">انبار مکانیزه مرکزی شورآباد</option>
                      <option value="شعبه مرکزی تهران و شعب سراسر کشور">شعبه مرکزی و ۳۱ شعبه استانی فروش</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewJob(false)}
                    className="px-3 py-1.5 text-xs text-text-2 hover:bg-surface-2 rounded-[8px]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingJobSubmitting || !newJobTitle.trim()}
                    className="px-3.5 py-1.5 text-xs font-bold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-[8px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isCreatingJobSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>ثبت موقعیت شغلی</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Drag & Drop Zone with Dashed Brand Border */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[14px] p-6 text-center transition-all ${
              dragActive
                ? 'border-brand bg-brand-soft/40 ring-4 ring-brand/20 scale-[1.01]'
                : 'border-brand/40 bg-brand-soft/15 hover:border-brand hover:bg-brand-soft/25'
            }`}
          >
            <input
              ref={manualFileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf,.zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processIncomingFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />

            <input
              ref={zipFileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processIncomingFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />

            {isExtractingZip ? (
              <div className="py-6 space-y-2">
                <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
                <div className="text-sm font-bold text-text-1">
                  در حال استخراج و بازگشایی محتوای فایل فشرده ZIP...
                </div>
                <div className="text-xs text-text-3">
                  تفکیک و آماده‌سازی فایل‌های رزومه داخل آرشیو
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2.5 text-brand">
                  <div className="w-11 h-11 rounded-[12px] bg-brand-soft flex items-center justify-center border border-brand/20">
                    <FileText className="w-5 h-5 text-brand" />
                  </div>
                  <div className="w-11 h-11 rounded-[12px] bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/20">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-extrabold text-text-1">
                    فایل‌های رزومه یا آرشیو ZIP را اینجا بکشید و رها کنید
                  </div>
                  <p className="text-xs text-text-3 mt-1">
                    پشتیبانی از PDF، Word (DOCX)، متنی و فایل فشرده ZIP با اکسترکت خودکار
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => manualFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-surface-1 hover:bg-surface-2 text-text-1 rounded-[10px] border border-border-default text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-brand" />
                    <span>انتخاب دستی فایل‌ها</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => zipFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-brand-soft hover:opacity-90 text-brand rounded-[10px] border border-brand/30 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>آپلود فایل فشرده ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ZIP Extraction Success Banner */}
          {zipMessage && (
            <div className="bg-brand-soft/50 border border-brand/30 rounded-[12px] p-3 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-text-1 font-bold">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                <span>
                  فایل فشرده «{zipMessage.name}» با موفقیت باز شد ({toPersianDigits(zipMessage.count)} رزومه استخراج گردید).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setZipMessage(null)}
                className="text-text-3 hover:text-text-1 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Per-file Status Rows (icon, name, parse status: success/failure reason) */}
          {stagedFiles.length > 0 && (
            <div className="bg-surface-2 rounded-[12px] p-3.5 border border-border-default space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-1">فایل‌های انتخاب‌شده:</span>
                  <span className="text-[11px] font-extrabold bg-brand-soft text-brand px-2 py-0.5 rounded-full border border-brand/20">
                    {toPersianDigits(stagedFiles.length)} رزومه
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleClearAllFiles}
                  className="text-[11px] text-danger hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف همه</span>
                </button>
              </div>

              {/* Scrollable files container */}
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs">
                {stagedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-surface-1 p-2.5 rounded-[10px] border border-border-default hover:border-brand/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                      {file.sourceZip ? (
                        <FolderArchive className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-brand shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold truncate text-xs text-text-1 max-w-[260px] sm:max-w-[340px]">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-text-3">
                          {formatFileSize(file.size)}
                          {file.sourceZip && ` • منبع: ${file.sourceZip}`}
                        </div>
                      </div>
                    </div>

                    {/* Parse status pill */}
                    <div className="flex items-center gap-2 shrink-0">
                      {file.extracting ? (
                        <span className="text-[10px] bg-info-soft text-info border border-info/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>در حال استخراج متن...</span>
                        </span>
                      ) : file.text ? (
                        <span className="text-[10px] bg-success-soft text-success border border-success/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>متن استخراج شد</span>
                        </span>
                      ) : (
                        <span
                          className="text-[10px] bg-danger-soft text-danger border border-danger/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                          title={file.extractionError || 'متن فایل قابل استخراج نیست'}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>بدون متن (اسکن تصویری)</span>
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-text-3 hover:text-danger p-1 rounded-md transition-colors"
                        title="حذف فایل"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status summary */}
              <div className="pt-2 border-t border-border-default flex items-center justify-between text-xs">
                <span className="text-text-2 font-medium text-[11px]">
                  {stagedFiles.some((f) => f.extracting)
                    ? 'در حال استخراج متن فایل‌ها...'
                    : `${toPersianDigits(stagedFiles.filter((f) => f.text).length)} رزومه با متن معتبر آماده پردازش` +
                      (stagedFiles.some((f) => f.extractionError)
                        ? ` — ${toPersianDigits(stagedFiles.filter((f) => f.extractionError).length)} فایل غیرقابل استخراج`
                        : '')}
                </span>
              </div>
            </div>
          )}

          {stagedFiles.length === 0 && (
            <div className="bg-surface-2 px-3.5 py-2.5 rounded-[10px] border border-border-default text-xs text-text-3 text-center">
              برای آغاز غربالگری، فایل‌های رزومه متقاضیان را اضافه نمایید.
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-2 bg-danger-soft border border-danger/30 text-danger px-3.5 py-2.5 rounded-[10px] text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Real-time Progress Bar (RTL-correct with brand styling) */}
          {isProcessing && (
            <div className="space-y-2.5 bg-surface-2 p-4 rounded-[12px] border border-border-default">
              <div className="flex items-center justify-between text-xs font-bold text-text-1">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-brand animate-spin" />
                  <span>{progressStageText || 'در حال تطبیق و ارزیابی شایستگی‌ها...'}</span>
                </span>
                <span className="text-brand font-extrabold">{toPersianDigits(progress)}٪</span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-surface-0 rounded-full h-2.5 overflow-hidden border border-border-default">
                <div
                  className="bg-brand h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="text-[11px] text-text-3 text-center">
                سیستم در حال ثبت رزومه‌ها برای موقعیت «{selectedJob?.title}» است.
              </div>
            </div>
          )}

          {/* Processed Results Summary Card */}
          {processedStats && (
            <div className="bg-brand-soft/30 rounded-[12px] p-4 border border-brand/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-text-1">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                  <span>
                    ثبت {toPersianDigits(processedStats.total)} رزومه واقعی برای «{selectedJob?.title}» با موفقیت انجام شد
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-surface-1 p-2.5 rounded-[10px] border border-border-default shadow-2xs">
                  <div className="text-[10px] text-text-3 mb-0.5">ثبت در پایپ‌لاین</div>
                  <div className="text-base font-extrabold text-brand">
                    {toPersianDigits(processedStats.total)}
                  </div>
                </div>

                <div className="bg-surface-1 p-2.5 rounded-[10px] border border-border-default shadow-2xs">
                  <div className="text-[10px] text-text-3 mb-0.5">در انتظار بررسی</div>
                  <div className="text-base font-extrabold text-warning">
                    {toPersianDigits(processedStats.review)}
                  </div>
                </div>

                <div className="bg-surface-1 p-2.5 rounded-[10px] border border-border-default shadow-2xs">
                  <div className="text-[10px] text-text-3 mb-0.5">بدون متن قابل استخراج</div>
                  <div className="text-base font-extrabold text-text-3">
                    {toPersianDigits(processedStats.rejected)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3.5 border-t border-border-default flex items-center justify-between shrink-0 mt-3">
          <div className="text-[11px] text-text-3">
            {stagedFiles.length > 0 ? (
              <span>
                {toPersianDigits(stagedFiles.filter((f) => f.text).length)} رزومه معتبر آماده بارگذاری
              </span>
            ) : (
              <span>حداقل یک فایل رزومه انتخاب کنید</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-2 hover:bg-surface-2 rounded-[10px] transition-colors cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="button"
              disabled={
                isProcessing ||
                isExtractingZip ||
                stagedFiles.length === 0 ||
                stagedFiles.some((f) => f.extracting)
              }
              onClick={handleStartBulkProcessing}
              className="px-5 py-2.5 text-xs font-bold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-[10px] shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال پردازش...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {stagedFiles.filter((f) => f.text).length > 0
                      ? `شروع ارزیابی (${toPersianDigits(stagedFiles.filter((f) => f.text).length)} رزومه)`
                      : 'انتخاب فایل رزومه'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
