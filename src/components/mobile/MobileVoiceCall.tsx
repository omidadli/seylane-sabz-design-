import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  Send,
  Square,
  Play,
  HelpCircle,
  AudioWaveform as WaveIcon,
} from 'lucide-react';
import { VoiceCallMessage } from '../../types';

interface MobileVoiceCallProps {
  onBack?: () => void;
  onNavigateToJobAd?: (params?: any) => void;
  onNavigateToDepartments?: (deptId?: string) => void;
  onRunAutomation?: (category: string) => void;
}

export const MobileVoiceCall: React.FC<MobileVoiceCallProps> = ({
  onBack,
  onNavigateToJobAd,
  onNavigateToDepartments,
  onRunAutomation,
}) => {
  const [callStatus, setCallStatus] = useState<'CONNECTING' | 'CONNECTED' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('CONNECTED');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [transcript, setTranscript] = useState<VoiceCallMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'سلام و احترام مهندس عزیز! دستیار صوتی هوشمند منابع انسانی هلدینگ سیلانه سبز (دافی، کامان، میس‌ویک) در خدمت شماست. بفرمایید در خصوص کدام دپارتمان یا فرایند نیاز به اقدام دارید؟',
      timestamp: 'هم‌اکنون',
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioTesting, setAudioTesting] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a pleasant corporate assistant harmonic chime using Web Audio API
  const playAssistantChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  };

  // Pre-load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentInput]);

  // Handle Speech Recognition once on component mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fa-IR';

      recognition.onstart = () => {
        setIsListening(true);
        setCallStatus('LISTENING');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedTextRef.current += ' ' + trans;
          } else {
            interim += trans;
          }
        }

        const totalSpoken = (accumulatedTextRef.current + ' ' + interim).trim();
        if (totalSpoken) {
          setCurrentInput(totalSpoken);

          // Reset silence timer: user is still speaking!
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Generous 2.8-second silence pause before auto-submitting
          silenceTimeoutRef.current = setTimeout(() => {
            if (accumulatedTextRef.current.trim() || totalSpoken.trim()) {
              const textToSend = accumulatedTextRef.current.trim() || totalSpoken.trim();
              stopListeningAndSend(textToSend);
            }
          }, 2800);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          setCallStatus('CONNECTED');
        }
      };

      recognition.onend = () => {
        // If still flagged as listening (e.g. Chrome 60s timeout), restart smoothly
        setIsListening(false);
        if (callStatus === 'LISTENING') {
          setCallStatus('CONNECTED');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    if (isMuted) {
      setIsMuted(false);
    }
    accumulatedTextRef.current = '';
    setCurrentInput('');
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (e) {
          console.error('Cannot start recognition:', e);
        }
      }
    } else {
      // Fallback if browser doesn't support Web Speech API
      const sample = 'وضعیت پرسنل و شیفت‌های کارخانه اشتهارد چطوره؟';
      setCurrentInput(sample);
      setTimeout(() => {
        handleSendCommand(sample);
      }, 1000);
    }
  };

  const stopListeningAndSend = (textToSend?: string) => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);

    const message = (textToSend || currentInput || accumulatedTextRef.current).trim();
    if (message) {
      handleSendCommand(message);
    } else {
      setCallStatus('CONNECTED');
    }
    accumulatedTextRef.current = '';
    setCurrentInput('');
  };

  const cancelListening = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    accumulatedTextRef.current = '';
    setCurrentInput('');
    setCallStatus('CONNECTED');
  };

  // Speak text with guaranteed browser audio output and fallback
  const speakText = (text: string) => {
    if (!isSpeakerOn || typeof window === 'undefined' || !window.speechSynthesis) return;

    // First, play audible confirmation chime so sound is 100% audible immediately
    playAssistantChime();

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      // Clean text of non-spoken characters and markdown
      const cleanText = text
        .replace(/[*_#`[\]()]/g, '')
        .replace(/[🌿💼💰🏖️🏭⚡✍️📋✨]/gu, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Find best voice match: Persian -> Arabic -> Multilingual -> Default
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      let bestVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('fa'));
      if (!bestVoice) {
        bestVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ar'));
      }
      if (!bestVoice) {
        bestVoice = voices.find((v) => v.lang && (v.lang.startsWith('tr') || v.lang.startsWith('ur') || v.name.includes('Google')));
      }
      if (!bestVoice && voices.length > 0) {
        bestVoice = voices.find((v) => v.default) || voices[0];
      }

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = 'fa-IR';
      }

      utterance.rate = 0.92; // Slightly slower for clear, distinguished Persian diction
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setCallStatus('SPEAKING');
      };
      utterance.onend = () => {
        setCallStatus('CONNECTED');
      };
      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance warning:', e);
        setCallStatus('CONNECTED');
      };

      // Slight timeout ensures previous utterance cancels cleanly on Chrome
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 60);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setCallStatus('CONNECTED');
    }
  };

  const testAudioSpeaker = () => {
    setAudioTesting(true);
    speakText('تست صدای بلندگو. ارتباط صوتی با دستیار هوشمند هلدینگ سیلانه سبز برقرار است.');
    setTimeout(() => setAudioTesting(false), 3000);
  };

  const handleSendCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    const userMsg: VoiceCallMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: commandText,
      timestamp: 'هم‌اکنون',
    };

    setTranscript((prev) => [...prev, userMsg]);
    setCurrentInput('');
    setTypedMessage('');
    setCallStatus('THINKING');

    try {
      const res = await fetch('/api/ai/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandText }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || 'دستور صوتی پردازش نشد');
      }
      const data = await res.json();
      const reply = data.replyText || 'دستور شما دریافت شد.';
      // Audit fix AIA-01: a voice command never executes a data-mutating
      // automation on its own. Read-only/navigation intents run immediately;
      // mutating intents are labelled as awaiting explicit confirmation.
      const needsConfirm = !!data.requiresConfirmation;

      const botMsg: VoiceCallMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'هم‌اکنون',
        actionTaken: needsConfirm ? undefined : data.actionType,
        actionPayload: data.actionResult,
      };

      setTranscript((prev) => [...prev, botMsg]);
      speakText(reply);

      // Trigger navigation intents only (no side effects on the data).
      if (data.actionType === 'OPEN_JOB_GENERATOR' && onNavigateToJobAd) {
        setTimeout(() => onNavigateToJobAd(), 2200);
      } else if (data.actionType === 'SHOW_DEPARTMENT' && onNavigateToDepartments) {
        setTimeout(() => onNavigateToDepartments('dept-mfg'), 2200);
      } else if (data.actionType === 'RUN_AUTOMATION_PAYROLL' && onRunAutomation) {
        onRunAutomation('auto-payroll');
      } else if (data.actionType === 'RUN_AUTOMATION_SCREENING' && onRunAutomation) {
        onRunAutomation('auto-screening');
      }

      if (needsConfirm) {
        const confirmMsg: VoiceCallMessage = {
          id: `bot-confirm-${Date.now()}`,
          sender: 'assistant',
          text: 'این دستور روی داده‌های سامانه اثر می‌گذارد. پیش از اجرا، پنجره تایید برای شما نمایش داده می‌شود و بدون تایید صریح هیچ عملیاتی انجام نمی‌شود.',
          timestamp: 'هم‌اکنون',
        };
        setTranscript((prev) => [...prev, confirmMsg]);
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: VoiceCallMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `پردازش دستور صوتی ناموفق بود: ${(err as Error)?.message || 'خطای ارتباط با سرور'}. هیچ عملیاتی روی داده‌ها انجام نشد.`,
        timestamp: 'هم‌اکنون',
      };
      setTranscript((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
      setCallStatus('CONNECTED');
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const quickVoiceChips = [
    { label: '✍️ تنظیم آگهی مدیر برند دافی', command: 'برای دپارتمان مارکتینگ یک آگهی شغلی برای مدیر برند دافی تنظیم کن' },
    { label: '🏭 وضعیت کارخانه اشتهارد', command: 'وضعیت پرسنل و شیفت‌های تولید کارخانه اشتهارد چطوره؟' },
    { label: '💰 صدور خودکار فیش حقوقی', command: 'فیش‌های حقوقی این ماه پرسنل سیلانه سبز را صادر کن' },
    { label: '⚡ غربالگری رزومه‌ها با هوش مصنوعی', command: 'رزومه‌های ورودی هفته اخیر را غربالگری و اولویت‌بندی کن' },
    { label: '🏖️ بررسی مرخصی‌های معوقه', command: 'درخواست‌های مرخصی معوقه را بررسی و تایید کن' },
    { label: '🏢 لیست دپارتمان‌های هلدینگ', command: 'دپارتمان‌های هلدینگ سیلانه سبز را معرفی کن' },
  ];

  return (
    <div className="relative min-h-[620px] h-full flex flex-col bg-gradient-to-b from-emerald-950 via-slate-950 to-black text-white rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 border border-emerald-800/40">
      {/* Top Call Navigation & Status Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              title="بازگشت"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-300">دستیار صوتی هلدینگ سیلانه سبز</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Speaker Button */}
          <button
            onClick={testAudioSpeaker}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-800/60 hover:bg-emerald-700 text-[10px] text-emerald-200 border border-emerald-500/30 cursor-pointer transition-colors"
            title="تست صدای اسپیکر"
          >
            <Volume2 className="w-3 h-3 text-emerald-300" />
            <span>تست صدا</span>
          </button>

          <div className="px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-mono font-semibold">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-2 relative z-10">
        {/* Animated Sound Wave Rings */}
        <div className="relative flex items-center justify-center my-2">
          <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping pointer-events-none" />
          <div
            className={`absolute w-36 h-36 rounded-full border transition-all duration-500 ${
              callStatus === 'LISTENING'
                ? 'border-amber-400/50 scale-110 animate-pulse'
                : callStatus === 'SPEAKING'
                ? 'border-emerald-400/70 scale-120 animate-pulse'
                : 'border-emerald-500/20'
            }`}
          />
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-400 p-1 shadow-2xl shadow-emerald-500/40 flex items-center justify-center relative">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center gap-0.5">
              <Bot className="w-9 h-9 text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-300 tracking-wider">SEILANEH SABZ</span>
            </div>
          </div>
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-center gap-1.5 h-7 my-1.5">
          {[30, 65, 45, 90, 50, 100, 65, 80, 40, 95, 55, 75].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                callStatus === 'SPEAKING'
                  ? 'bg-emerald-400 animate-pulse'
                  : callStatus === 'LISTENING'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-800/40'
              }`}
              style={{
                height:
                  callStatus === 'SPEAKING' || callStatus === 'LISTENING'
                    ? `${Math.max(20, h * (0.6 + Math.sin(i + callDuration * 2) * 0.4))}%`
                    : '20%',
              }}
            />
          ))}
        </div>

        {/* Status Text Indicator */}
        <div className="text-center">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-1.5">
            دستیار هوشمند منابع انسانی سیلانه سبز
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </h2>
          <p className="text-xs text-emerald-300/90 mt-0.5 font-medium">
            {callStatus === 'LISTENING'
              ? '🎤 در حال گوش دادن به شما... (صحبت کنید، وقتی تمام شد کلید ارسال را بزنید)'
              : callStatus === 'THINKING'
              ? '⚡ در حال پردازش دستور با هوش مصنوعی...'
              : callStatus === 'SPEAKING'
              ? '🔊 در حال صحبت و قرائت پاسخ با صدای دستیار...'
              : '🟢 دکمه میکروفون را لمس کنید و صحبت کنید'}
          </p>
        </div>

        {/* Active Speech Recognition Live Box (Shown while listening or when text accumulated) */}
        {isListening && (
          <div className="w-full max-w-md mt-2 bg-amber-500/10 border-2 border-amber-400/50 rounded-2xl p-3 animate-fade-in shadow-lg">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                کلمات شما در حال دریافت است:
              </span>
              <span className="text-[10px] text-amber-200/80">تشخیص زنده فارسی</span>
            </div>

            <p className="text-sm text-white font-medium min-h-[38px] leading-relaxed bg-slate-900/60 p-2 rounded-xl">
              {currentInput || 'در حال شنیدن... لطفاً با صدای رسا صحبت فرمایید.'}
            </p>

            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-amber-400/20">
              <button
                onClick={cancelListening}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                لغو صحبت
              </button>
              <button
                onClick={() => stopListeningAndSend()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>پایان صحبت و ارسال فوری</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Conversation Transcript Box */}
        <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-md rounded-2xl p-3 border border-white/10 mt-2.5 max-h-44 overflow-y-auto space-y-2.5 text-xs">
          {transcript.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-teal-700 text-white shadow-md'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600/35 text-emerald-100 border border-emerald-500/30 rounded-tr-none text-right'
                    : 'bg-white/10 text-slate-100 border border-white/10 rounded-tl-none text-right'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Re-play audio button for assistant responses */}
                {msg.sender === 'assistant' && (
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => speakText(msg.text)}
                      className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 font-semibold cursor-pointer transition-colors"
                      title="پخش مجدد این پیام با صدای دستیار"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>پخش صوتی مجدد</span>
                    </button>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>
                )}

                {msg.actionTaken && (
                  <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>اقدام انجام‌شده: {msg.actionTaken}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Quick Voice Command Chips */}
      <div className="z-10 my-1.5">
        <div className="text-[11px] text-slate-400 mb-1 font-medium flex items-center justify-between">
          <span>فرمان‌های صوتی سریع (لمس برای تست فوری):</span>
          <span className="text-[10px] text-emerald-400">فارسی روان</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickVoiceChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendCommand(chip.command)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-emerald-600/40 text-emerald-200 hover:text-white border border-white/10 hover:border-emerald-500/40 text-[11px] transition-all cursor-pointer whitespace-nowrap"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fallback Text Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (typedMessage.trim()) {
            handleSendCommand(typedMessage);
          }
        }}
        className="flex items-center gap-1.5 my-1 bg-white/5 p-1 rounded-xl border border-white/10 z-10"
      >
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="یا دستور خود را اینجا تایپ کنید تا دستیار پاسخ داده و بخواند..."
          className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!typedMessage.trim()}
          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white cursor-pointer transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Bottom Phone Call Action Controls */}
      <div className="flex items-center justify-around pt-2.5 border-t border-white/10 z-10">
        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`flex flex-col items-center gap-1 p-2 rounded-full cursor-pointer transition-colors ${
            isMuted ? 'text-amber-400 bg-amber-500/20' : 'text-slate-300 hover:bg-white/10'
          }`}
          title={isMuted ? 'میکروفون غیرفعال' : 'میکروفون فعال'}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </div>
          <span className="text-[10px]">{isMuted ? 'بی‌صدا' : 'میکروفون'}</span>
        </button>

        {/* Big Start / Stop Speaking Button */}
        {isListening ? (
          <button
            onClick={() => stopListeningAndSend()}
            className="w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all transform active:scale-95 bg-amber-500 text-slate-950 shadow-amber-500/50 animate-pulse border-2 border-white"
            title="پایان صحبت و ارسال"
          >
            <Square className="w-6 h-6 fill-current" />
            <span className="text-[9px] font-black mt-0.5">ارسال</span>
          </button>
        ) : (
          <button
            onClick={startListening}
            className="w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all transform active:scale-95 bg-emerald-500 text-white shadow-emerald-500/50 hover:bg-emerald-400 border-2 border-emerald-300/40"
            title="لمس برای شروع صحبت"
          >
            <Mic className="w-7 h-7" />
            <span className="text-[9px] font-bold mt-0.5">صحبت</span>
          </button>
        )}

        {/* Speaker Volume Toggle Button */}
        <button
          onClick={() => {
            const next = !isSpeakerOn;
            setIsSpeakerOn(next);
            if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-full cursor-pointer transition-colors ${
            !isSpeakerOn ? 'text-rose-400 bg-rose-500/20' : 'text-slate-300 hover:bg-white/10'
          }`}
          title={isSpeakerOn ? 'بلندگو روشن' : 'بلندگو خاموش'}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            {isSpeakerOn ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <span className="text-[10px]">{isSpeakerOn ? 'بلندگو روشن' : 'بلندگو خاموش'}</span>
        </button>

        {/* End Call Button */}
        {onBack && (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              onBack();
            }}
            className="flex flex-col items-center gap-1 p-2 text-rose-400 hover:bg-white/10 rounded-full cursor-pointer"
            title="پایان تماس"
          >
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
              <PhoneOff className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-rose-300">خروج</span>
          </button>
        )}
      </div>
    </div>
  );
};
