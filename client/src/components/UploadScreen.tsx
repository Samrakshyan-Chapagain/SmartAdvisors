import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Shield, ExternalLink, ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ProcessingOverlay from './ProcessingOverlay';

// Spec: College of Engineering only (value "eng"), 6 majors mapped to backend codes
const ENGINEERING_MAJORS: { name: string; code: string }[] = [
  { name: 'Aerospace Engineering', code: 'MAE' },
  { name: 'Civil Engineering', code: 'CE' },
  { name: 'Computer Science', code: 'CS' },
  { name: 'Electrical Engineering', code: 'EE' },
  { name: 'Industrial Engineering', code: 'IE' },
  { name: 'Mechanical Engineering', code: 'MAE' },
];

interface UploadScreenProps {
  file: File | null;
  department: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile?: () => void;
  setDepartment: (dept: string) => void;
  onNext: () => void;
  onSkipTranscript?: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

type DropState = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadScreen({
  file,
  department,
  onFileChange,
  onClearFile,
  setDepartment,
  onNext,
  onSkipTranscript,
  onBack,
  isLoading = false,
}: UploadScreenProps) {
  const [selectedCollege, setSelectedCollege] = useState<string>(department ? 'eng' : '');
  const [dropState, setDropState] = useState<DropState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const dropzoneRef = useRef<HTMLDivElement>(null);
  const hasFile = !!file;
  const collegeSelected = selectedCollege === 'eng';
  const majorSelected = !!department;
  const ctaEnabled = hasFile && collegeSelected && majorSelected;

  // Sync department when returning user has pre-selected
  useEffect(() => {
    if (department && !selectedCollege) setSelectedCollege('eng');
  }, [department, selectedCollege]);

  // Sync drop state when file prop changes (e.g. parent set or cleared)
  useEffect(() => {
    if (file) setDropState('success');
    else setDropState((prev) => (prev === 'error' ? prev : 'idle'));
  }, [file]);

  // File change handler with validation
  const handleFile = (f: File | null) => {
    if (!f) {
      setDropState('idle');
      setErrorMsg('');
      return;
    }
    if (f.type !== 'application/pdf') {
      setErrorMsg('PDF files only please.');
      setDropState('error');
      setTimeout(() => {
        setDropState('idle');
        setErrorMsg('');
      }, 2800);
      return;
    }
    setDropState('uploading');
    setProgress(0);
    const t1 = setTimeout(() => setProgress(92), 800);
    const t2 = setTimeout(() => setProgress(100), 1200);
    setTimeout(() => {
      clearTimeout(t1);
      clearTimeout(t2);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      const dt = new DataTransfer();
      dt.items.add(f);
      input.files = dt.files;
      onFileChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
      setDropState('success');
    }, 1200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemoveFile = () => {
    onClearFile?.();
    setDropState('idle');
    setErrorMsg('');
  };

  const handleCollegeChange = (val: string) => {
    setSelectedCollege(val);
    setDepartment('');
  };

  const handleMajorChange = (code: string) => {
    setDepartment(code);
  };

  return (
    <div className="h-full font-body bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      <div className="sa-page-bg" aria-hidden />

      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Top bar — Back button, no overlap */}
        <div className="flex-shrink-0 px-6 py-2.5">
          <button onClick={onBack} className="flex items-center gap-2 text-[var(--sub)] hover:text-[var(--text)] transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0" style={{ gridTemplateRows: 'minmax(0, 1fr)' }}>
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col justify-center px-8 xl:px-12 py-6 pb-8 border-r border-[var(--border)]"
        >
          <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[rgba(91,124,250,0.3)] via-[rgba(255,107,53,0.2)] to-transparent" />
          <div className="flex flex-col gap-3 max-w-[440px]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-[1.5px] bg-[var(--blue)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--blue)]">Step 1 of 3</span>
            </div>
            <h1 className="font-heading font-extrabold text-[clamp(44px,5.5vw,58px)] leading-[0.98] tracking-[-2.5px]">
              Let's find
              <br />
              your <span className="gradient-text">perfect</span>
              <br />
              semester.
            </h1>
            <p className="text-[16px] font-normal text-[var(--sub)] leading-[1.7] max-w-[360px]">
              Upload your transcript and we'll map out every course you're eligible for — then match you with the right professors.
            </p>
            <div className="flex flex-col gap-2.5 mt-1">
              {[
                { num: 1, name: 'Upload Transcript', desc: "Your unofficial PDF from MyMav", active: true },
                { num: 2, name: 'Set Preferences', desc: 'Tell us what matters to you', active: false },
                { num: 3, name: 'Get Matches', desc: 'Curated courses + professors', active: false },
              ].map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="st-item flex items-start gap-4"
                >
                  <div className="relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: s.active ? 'rgba(91,124,250,0.1)' : 'var(--s1)',
                      border: '1.5px solid',
                      borderColor: s.active ? 'var(--blue)' : 'var(--border2)',
                      color: s.active ? 'var(--blue)' : 'var(--sub2)',
                    }}
                  >
                    {s.active && (
                      <span className="absolute inset-[-4px] rounded-full border border-dashed border-[rgba(91,124,250,0.3)] animate-spin" style={{ animationDuration: '8s' }} />
                    )}
                    {s.num}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold" style={{ color: s.active ? 'var(--text)' : '#8892b8' }}>{s.name}</span>
                    <span className="text-[12px] text-[#6b75a8]">{s.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-xl border flex-shrink-0" style={{ background: 'rgba(52,211,153,0.04)', borderColor: 'rgba(52,211,153,0.12)' }}>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.2)' }}>
                  <Shield className="w-4 h-4 text-[var(--green)]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[var(--green)] mb-0.5">100% Private</h4>
                  <p className="text-[12px] font-normal text-[var(--sub)]">Processed securely to generate your recommendations. We do not display any sharing or storage step in this flow.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right panel — centered content */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center min-h-0 overflow-hidden px-8 xl:px-10 py-6"
        >
          <div className="flex flex-col gap-2.5 w-full max-w-[460px] mx-auto">
            {/* Drop zone */}
            <div
              ref={dropzoneRef}
              className={`relative rounded-xl py-5 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden border
                ${dropState === 'success' ? 'pointer-events-none border-solid' : 'border-dashed'}
                ${dropState === 'error' ? 'border-2 border-[var(--red)]' : ''}
                ${dragOver ? '!border-[var(--orange)]' : ''}
                ${dropState === 'idle' && !dragOver ? 'hover:!border-[rgba(91,124,250,0.5)]' : ''}
              `}
              style={{
                background: dropState === 'success' ? 'rgba(52,211,153,0.08)' : dropState === 'error' ? 'rgba(248,113,113,0.08)' : dragOver ? 'rgba(255,107,53,0.06)' : 'var(--s1)',
                borderColor: dropState === 'success' ? 'var(--green)' : dropState === 'error' ? undefined : dropState === 'idle' && !dragOver ? 'var(--border2)' : undefined,
                borderWidth: dropState === 'error' ? 2 : 1.5,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files[0] || null);
              }}
              onClick={() => dropState === 'idle' && document.getElementById('file-input')?.click()}
            >
              <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={handleInputChange} />
              {dropState === 'idle' && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-[20px]"
                  style={{ background: 'linear-gradient(135deg, rgba(91,124,250,0.04), rgba(255,107,53,0.03))', border: '1px solid rgba(91,124,250,0.5)' }}
                />
              )}
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-2
                  ${dropState === 'success' ? 'bg-[var(--green)]/20' : ''}
                  ${dropState === 'idle' ? 'sa-dz-blob--idle' : ''}
                  ${dropState === 'uploading' ? 'sa-dz-blob--busy' : ''}
                `}
                style={{
                  background: dropState === 'idle' || dropState === 'uploading' ? 'linear-gradient(135deg, rgba(91,124,250,0.15), rgba(255,107,53,0.1))' : undefined,
                  border: '1.5px solid rgba(91,124,250,0.2)',
                }}
              >
                {dropState === 'success' ? (
                  <svg className="w-6 h-6 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <>
                    <span className="absolute inset-[-5px] rounded-full border border-dashed border-[rgba(91,124,250,0.15)] animate-spin" style={{ animationDuration: '12s' }} />
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5b7cfa" /><stop offset="1" stopColor="#ff6b35" /></linearGradient>
                      </defs>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </>
                )}
              </div>
              <h3 className="font-heading font-bold text-[15px] tracking-[-0.4px] mb-0.5">
                {dropState === 'uploading' ? 'Scanning...' : dropState === 'success' ? 'Transcript loaded!' : 'Drop your transcript here'}
              </h3>
              <p className="text-xs font-normal text-[var(--sub)] mb-1.5">
                {dropState === 'uploading' ? 'Just a moment' : dropState === 'success' ? (
                  <span className="text-[var(--green)]">Ready to process</span>
                ) : (
                  <>Click to browse or drag and drop</>
                )}
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--sub2)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                {dropState === 'success' ? '✓' : 'PDF only'}
              </span>
              {dropState === 'uploading' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--border)]">
                  <div className="h-full bg-gradient-to-r from-[var(--blue)] to-[var(--orange)] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
              {dropState === 'error' && <p className="text-[var(--red)] text-sm mt-2">{errorMsg}</p>}
            </div>

            {/* File pill */}
            {hasFile && file && (
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-[rgba(52,211,153,0.2)]" style={{ background: 'rgba(52,211,153,0.06)' }}>
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <svg className="w-3.5 h-3.5 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs font-medium text-[var(--green)] truncate flex-1">{file.name}</span>
                <button onClick={handleRemoveFile} className="text-[var(--sub)] hover:text-[var(--red)] transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* How-to */}
            <div className="rounded-lg border p-3 text-left" style={{ background: 'rgba(91,124,250,0.05)', borderColor: 'rgba(91,124,250,0.12)' }}>
              <h4 className="text-[var(--blue)] font-bold text-xs mb-1 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" /> How to get your unofficial transcript?
              </h4>
              <p className="text-[var(--text)] text-[11px] leading-snug mb-1">
                Log into MyMav, go to <strong>Academic Records</strong>, and select <strong>View Unofficial Transcript</strong>. Save as PDF.
              </p>
              <a href="https://uta.service-now.com/selfservice?id=utassp01_kb_article&sys_id=fd187c6edbd48cd8d48b5e65ce96194a" target="_blank" rel="noopener noreferrer" className="text-[var(--orange)] font-semibold text-xs hover:underline">
                View Official Guide →
              </a>
            </div>

            {/* College + Major — stacked, Major only after College */}
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--sub)]">
                  COLLEGE <span className="w-1 h-1 rounded-full bg-[var(--orange)]" />
                </label>
                <div className="relative transition-transform duration-200 focus-within:scale-[1.01]">
                  <select
                    value={selectedCollege}
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    className="w-full py-2.5 pl-3 pr-10 rounded-lg border appearance-none bg-[var(--s1)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)]"
                    style={{ borderWidth: '1.5px', borderColor: 'var(--border2)' }}
                  >
                    <option value="" className="bg-[var(--s1)] text-[var(--sub)]">Choose...</option>
                    <option value="eng" className="bg-[var(--s1)] text-[var(--text)]">College of Engineering</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--sub)] pointer-events-none" />
                </div>
              </div>
              {selectedCollege && (
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--sub)]">
                  MAJOR <span className="w-1 h-1 rounded-full bg-[var(--orange)]" />
                </label>
                <div className="relative transition-transform duration-200 focus-within:scale-[1.01]">
                  <select
                    value={department}
                    onChange={(e) => handleMajorChange(e.target.value)}
                    disabled={!selectedCollege}
                    className="w-full py-2.5 pl-3 pr-10 rounded-lg border appearance-none bg-[var(--s1)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] disabled:opacity-50"
                    style={{ borderWidth: '1.5px', borderColor: 'var(--border2)' }}
                  >
                    <option value="" className="bg-[var(--s1)] text-[var(--sub)]">Choose...</option>
                    {ENGINEERING_MAJORS.map((m) => (
                      <option key={m.code + m.name} value={m.code} className="bg-[var(--s1)] text-[var(--text)]">{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--sub)] pointer-events-none" />
                </div>
              </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                if (!ctaEnabled) return;
                onNext();
              }}
              disabled={!ctaEnabled}
              className="relative w-full py-3 rounded-xl font-heading font-bold text-[15px] tracking-[-0.3px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed group overflow-hidden hover:-translate-y-0.5 hover:opacity-[0.98] disabled:hover:translate-y-0 disabled:hover:opacity-80"
              style={{
                background: ctaEnabled
                  ? 'linear-gradient(135deg, var(--blue), var(--blue2), var(--orange2))'
                  : 'linear-gradient(135deg, rgba(91,124,250,0.55), rgba(65,102,245,0.55), rgba(229,90,40,0.55))',
                boxShadow: ctaEnabled
                  ? '0 4px 28px rgba(91,124,250,0.25), 0 2px 10px rgba(255,107,53,0.15)'
                  : 'none',
              }}
            >
              <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)' }} />
              <span className="relative z-10">Find My Courses</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>

            {onSkipTranscript && selectedCollege === 'eng' && department && (
              <button
                type="button"
                onClick={onSkipTranscript}
                className="w-full py-2 text-center text-sm font-semibold text-[var(--sub2)] transition-colors hover:text-[var(--text)]"
              >
                I don&apos;t have a transcript yet — continue without
              </button>
            )}
          </div>
        </motion.div>
        </div>
      </div>

      <ProcessingOverlay
        isVisible={isLoading}
        title="Analyzing Your Unofficial Transcript"
        steps={['Reading your PDF...', 'Extracting course data...', 'Matching completed courses...']}
        icon="transcript"
      />
    </div>
  );
}
