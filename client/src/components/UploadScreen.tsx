import React, { useState } from 'react';
import { UploadCloud, FileText, ArrowRight, ArrowLeft, CheckCircle, ExternalLink, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProcessingOverlay from './ProcessingOverlay';
import { COLLEGES, getCollegeKeyForDegree } from '../config/colleges';

interface UploadScreenProps {
  file: File | null;
  department: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDepartment: (dept: string) => void;
  onNext: () => void;
  onSkipTranscript?: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function UploadScreen({ file, department, onFileChange, setDepartment, onNext, onSkipTranscript, onBack, isLoading = false }: UploadScreenProps) {
  // Derive initial college from department (for returning users)
  const [selectedCollege, setSelectedCollege] = useState(() => getCollegeKeyForDegree(department));

  const handleCollegeChange = (collegeKey: string) => {
    setSelectedCollege(collegeKey);
    setDepartment(''); // reset degree when college changes
  };

  const availableDegrees = selectedCollege ? COLLEGES[selectedCollege]?.degrees || [] : [];

  return (
    <div className="max-w-xl mx-auto">
      <ProcessingOverlay
        isVisible={isLoading}
        title="Analyzing Your Unofficial Transcript"
        steps={['Reading your PDF...', 'Extracting course data...', 'Matching completed courses...']}
        icon="transcript"
      />
      <button onClick={onBack} className="mb-2 text-white/60 hover:text-white flex items-center gap-2 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-10 text-center"
      >
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white'}`}>
          {file ? <CheckCircle className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">
            {file ? "Unofficial Transcript Loaded!" : "Upload Unofficial Transcript"}
        </h1>
        <p className="text-white/60 mb-8 text-lg">
            {file ? "We are ready to analyze your courses." : "We need your unofficial transcript (PDF) to see what you've taken."}
        </p>

        {/* Privacy Disclaimer */}
        <div className="bg-emerald-500/10 rounded-xl p-4 mb-6 border border-emerald-500/30 text-left">
            <h4 className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Your Privacy is Protected
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
                Your unofficial transcript is uploaded securely for parsing, then immediately deleted from our servers. We only extract your course list — no grades, GPA, or personal information is stored. All plan data stays in your browser.
            </p>
        </div>

        <div className={`group relative border-2 border-dashed rounded-2xl p-10 mb-6 transition-all cursor-pointer 
          ${file 
            ? 'border-emerald-500/50 bg-emerald-500/10' 
            : 'border-white/20 hover:border-[#FF8040] hover:bg-[#FF8040]/10'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            aria-label="Upload unofficial transcript PDF"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <div className={`p-4 rounded-full shadow-sm mb-3 transition-transform group-hover:scale-110 
              ${file ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'}`}
            >
                {file ? <FileText className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            
            <span className={`text-base font-bold transition-colors 
              ${file ? 'text-emerald-400' : 'text-[#0046FF] group-hover:text-[#FF8040]'}`}
            >
              {file ? file.name : "Click to browse or drag PDF"}
            </span>
          </div>
        </div>

        <div className="bg-[#0046FF]/10 rounded-xl p-4 mb-8 border border-[#0046FF]/20 text-left">
            <h4 className="text-[#0046FF] font-bold text-sm mb-1 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> How to get your unofficial transcript?
            </h4>
            <p className="text-white/60 text-sm leading-relaxed">
                Log into MyMav, go to <strong>Academic Records</strong>, and select <strong>View Unofficial Transcript</strong>. Save as PDF.
                <br/>
                <a href="https://uta.service-now.com/selfservice?id=utassp01_kb_article&sys_id=fd187c6edbd48cd8d48b5e65ce96194a&catid=&pageid=utassp02_kb_public_knowledge_base" 
                target="_blank" rel="noopener noreferrer" className="text-[#FF8040] font-bold hover:underline mt-1 inline-block">
                    View Official Guide &rarr;
                </a>
            </p>
        </div>

        <div className="mb-8 text-left space-y-4">
          {/* College dropdown */}
          <div>
            <label htmlFor="college-select" className="block text-sm font-bold text-white/80 mb-2 ml-1">College</label>
            <div className="relative">
              <select
                id="college-select"
                value={selectedCollege}
                onChange={(e) => handleCollegeChange(e.target.value)}
                aria-label="Select college"
                className={`w-full p-4 pr-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#0046FF] outline-none transition-all font-bold appearance-none ${
                  selectedCollege ? 'text-white' : 'text-white/40'
                }`}
              >
                <option value="" disabled className="text-black">Choose a college...</option>
                {Object.entries(COLLEGES).map(([key, college]) => (
                  <option key={key} value={key} className="text-black">{college.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Degree dropdown — appears after college is picked */}
          <AnimatePresence>
            {selectedCollege && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="degree-select" className="block text-sm font-bold text-white/80 mb-2 ml-1">Degree</label>
                <div className="relative">
                  <select
                    id="degree-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    aria-label="Select degree"
                    className={`w-full p-4 pr-10 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#0046FF] outline-none transition-all font-bold appearance-none ${
                      department ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    <option value="" disabled className="text-black">Choose a degree...</option>
                    {availableDegrees.map((deg) => (
                      <option key={deg.code} value={deg.code} className="text-black">{deg.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={onNext} disabled={!file || !department} className="w-full bg-[#0046FF] hover:bg-[#0036CC] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0046FF]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg group">
          Next Step <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {onSkipTranscript && department && (
          <button
            onClick={onSkipTranscript}
            className="w-full mt-3 text-white/40 hover:text-white/70 font-semibold text-sm py-2 transition-colors"
          >
            I don't have a transcript yet — start fresh
          </button>
        )}
      </motion.div>
    </div>
  );
}