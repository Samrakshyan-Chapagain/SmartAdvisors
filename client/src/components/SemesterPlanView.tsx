import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, BookOpen, Sparkles, GraduationCap, Clock, Download, Star, ChevronDown, FileUp, Pencil, TrendingUp, Layers } from 'lucide-react';

interface Professor {
  name: string;
  rating: number;
  difficulty: string;
  matchScore: number;
  wouldTakeAgain?: string | null;
  tags: string[];
  reviewCount: number;
}

interface PlannedCourse {
  code: string;
  name: string;
  creditHours: number;
  requirement: string;
  professors?: Professor[];
}

interface Semester {
  semester: number;
  label: string;
  courses: PlannedCourse[];
  totalHours: number;
}

interface SemesterPlanViewProps {
  plan: {
    plan: Semester[];
    totalSemesters: number;
    totalRemainingHours: number;
    stats?: {
      totalCourses: number;
      totalHours: number;
      completedCourses: number;
      completedHours: number;
    };
  };
  onBack: () => void;
  onEditPlan: () => void;
  onNewTranscript: () => void;
}

/* ── Difficulty helpers ── */
function getDifficultyStyle(difficulty: string) {
  const d = difficulty.toLowerCase();
  if (d.includes('easy')) return 'text-white bg-ds-green';
  if (d.includes('hard')) return 'text-white bg-ds-muted';
  return 'text-white bg-ds-orange';
}

function getTagColor(tag: string) {
  const t = tag.toLowerCase();
  if (t.includes('caring') || t.includes('amazing') || t.includes('inspirational') || t.includes('helpful'))
    return 'bg-ds-green/80 text-white';
  if (t.includes('tough') || t.includes('hard') || t.includes('strict'))
    return 'bg-ds-muted/80 text-white';
  if (t.includes('take again'))
    return 'bg-ds-purple/80 text-white';
  return 'bg-ds-orange/60 text-white';
}

/* ── Professor initials helper ── */
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Course Card ── */
function CourseRow({ course }: { course: PlannedCourse }) {
  const [expanded, setExpanded] = useState(false);
  const hasProfessors = course.professors && course.professors.length > 0;
  const isElective = course.requirement === 'elective';

  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-200 group bg-ds-card border-l-4 ${
      isElective ? 'border-l-ds-orange' : 'border-l-ds-purple'
    } shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(91,124,250,0.15)]`}>
      {/* Course header */}
      <div
        className={`flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 ${hasProfessors ? 'cursor-pointer' : ''} hover:bg-white/[0.03] transition-colors`}
        onClick={() => hasProfessors && setExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${isElective ? 'bg-ds-orange' : 'bg-ds-purple'}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-ds-text font-semibold text-sm sm:text-base">{course.code}</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide ${
                isElective ? 'bg-ds-orange/20 text-ds-orange' : 'bg-ds-purple/20 text-ds-purple'
              }`}>
                {isElective ? 'Elective' : 'Core'}
              </span>
            </div>
            <p className="text-ds-body text-xs sm:text-sm truncate mt-0.5">{course.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2 sm:ml-3">
          <span className="text-ds-muted text-[10px] sm:text-xs font-semibold bg-white/5 px-2 sm:px-2.5 py-1 rounded-lg">{course.creditHours} hrs</span>
          {hasProfessors && (
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-ds-muted"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          )}
        </div>
      </div>

      {/* Expandable professor section */}
      <AnimatePresence>
        {expanded && hasProfessors && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-5 pb-3 sm:pb-4 pt-2 border-t border-ds-muted/20">
              <p className="text-ds-muted text-[11px] font-semibold uppercase tracking-[0.05em] mb-2 sm:mb-3">Top Professors</p>
              <div className="space-y-2 sm:space-y-3">
                {course.professors!.map((prof, i) => (
                  <div
                    key={prof.name}
                    className={`rounded-xl p-3 sm:p-4 border transition-all duration-200 hover:bg-white/[0.04] relative ${
                      i === 0
                        ? 'bg-gradient-to-r from-ds-orange/10 to-transparent border-ds-orange/25'
                        : 'bg-[#1a1d35] border-ds-muted/20'
                    } hover:shadow-[0_0_30px_rgba(91,124,250,0.12)]`}
                  >
                    {/* Recommended badge for top professor */}
                    {i === 0 && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-ds-orange to-ds-coral text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide">
                          <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" /> Recommended
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5 sm:gap-3.5">
                      {/* Avatar */}
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] sm:text-xs font-bold ${
                        i === 0 ? 'bg-gradient-to-br from-ds-orange to-ds-coral text-white' : 'bg-gradient-to-br from-ds-purple to-ds-coral text-white'
                      }`}>
                        {getInitials(prof.name)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-ds-text font-semibold text-sm block truncate">
                          {prof.name}
                        </span>
                        {/* Tags */}
                        {prof.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {prof.tags.slice(0, 3).map((tag, ti) => (
                              <span key={ti} className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getTagColor(tag)}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Stats */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {prof.rating > 0 && (
                          <span className="flex items-center gap-1 text-ds-orange font-bold text-sm">
                            <Star className="w-3.5 h-3.5 fill-ds-orange text-ds-orange" />
                            {prof.rating}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getDifficultyStyle(prof.difficulty)}`}>
                          {prof.difficulty}
                        </span>
                        {prof.wouldTakeAgain && (
                          <span className="text-ds-green font-semibold text-[11px]">{prof.wouldTakeAgain} retake</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SemesterPlanView({ plan, onBack, onEditPlan, onNewTranscript }: SemesterPlanViewProps) {
  const semesters = plan.plan || [];
  const totalCoursesPlanned = semesters.reduce((sum, s) => sum + s.courses.length, 0);

  const handlePrint = () => window.print();

  return (
    <div className="w-full max-w-[95%] mx-auto px-3 sm:px-0">

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white !important; color: black !important; }
          button, .no-print { display: none !important; }
          .semester-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .semester-card { background: white !important; border: 2px solid #333 !important; border-radius: 8px !important; break-inside: avoid !important; }
          .semester-card * { color: black !important; background: transparent !important; }
          svg { width: 12px !important; height: 12px !important; stroke: black !important; }
        }
      `}</style>

      {/* Top controls */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 no-print">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-ds-muted hover:text-ds-text transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-5 bg-ds-muted/20 hidden sm:block" />
          <button
            onClick={onEditPlan}
            className="flex items-center gap-2 bg-ds-card hover:bg-ds-card/80 border border-ds-muted/30 hover:border-ds-purple/50 text-ds-body hover:text-ds-text px-3 sm:px-4 py-2 rounded-xl transition-all font-bold text-xs sm:text-sm"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Plan
          </button>
          <button
            onClick={onNewTranscript}
            className="flex items-center gap-2 border border-ds-muted/30 hover:border-red-500/40 text-ds-muted hover:text-red-400 px-3 sm:px-4 py-2 rounded-xl transition-all font-bold text-xs sm:text-sm"
          >
            <FileUp className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Unofficial</span> Transcript
          </button>
        </div>
        <button
          onClick={handlePrint}
          className="btn-gradient flex items-center gap-2 !px-4 sm:!px-5 !py-2 sm:!py-2.5 !rounded-xl text-xs sm:text-sm w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" /> Save as PDF
        </button>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ds-text mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
          Your Degree Plan <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10 text-ds-orange" />
        </h2>

        {/* Top summary badges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-5">
          <span className="flex items-center gap-2 bg-ds-purple text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-ds-purple/25 w-full sm:w-auto justify-center">
            <Layers className="w-4 h-4" /> {totalCoursesPlanned} courses
          </span>
          <span className="flex items-center gap-2 bg-ds-orange text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-ds-orange/25 w-full sm:w-auto justify-center">
            <Calendar className="w-4 h-4" /> {semesters.length} semesters
          </span>
          <span className="flex items-center gap-2 bg-ds-purple text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-ds-purple/25 w-full sm:w-auto justify-center">
            <TrendingUp className="w-4 h-4" /> {plan.totalRemainingHours} credit hours remaining
          </span>
        </div>

        {/* Bottom progress badges */}
        {plan.stats && (
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 bg-ds-card/40 border-2 border-ds-purple/50 text-ds-purple font-semibold px-3 sm:px-4 py-1.5 rounded-full">
              <BookOpen className="w-3.5 h-3.5" /> {plan.stats.completedCourses}/{plan.stats.totalCourses} completed
            </span>
            <span className="flex items-center gap-1.5 bg-ds-card/40 border-2 border-ds-muted/50 text-ds-muted font-semibold px-3 sm:px-4 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> {plan.stats.completedHours}/{plan.stats.totalHours} credit hours
            </span>
            <span className="flex items-center gap-1.5 bg-ds-card/40 border-2 border-ds-orange/50 text-ds-orange font-semibold px-3 sm:px-4 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" /> ~{semesters.length} semesters to go
            </span>
          </div>
        )}
      </motion.div>

      {/* Semester cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 semester-grid">
        {semesters.map((semester, idx) => (
          <motion.div
            key={semester.semester}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="semester-card rounded-2xl overflow-hidden border border-ds-muted/15 hover:border-ds-purple/40 transition-all duration-200 bg-ds-bg-sec shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(91,124,250,0.2)]"
          >
            {/* Semester header with gradient */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between bg-gradient-to-r from-ds-purple/10 to-ds-orange/10">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-ds-orange">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-ds-text font-bold text-base sm:text-xl truncate">{semester.label}</h3>
                  <p className="text-ds-muted text-xs sm:text-sm mt-0.5">{semester.courses.length} courses · tap to see professors</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-ds-orange bg-ds-orange/15 border border-ds-orange/30 flex-shrink-0 ml-2">
                {semester.totalHours} hrs
              </span>
            </div>

            {/* Course list */}
            <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
              {semester.courses.map((course) => (
                <CourseRow key={course.code} course={course} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 sm:mt-12 text-center no-print px-2"
      >
        <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-ds-card/50 border border-ds-muted/20 rounded-xl px-4 sm:px-6 py-3 sm:py-3.5">
          <Sparkles className="w-4 h-4 text-ds-orange" />
          <p className="text-ds-muted text-sm">
            This plan respects prerequisite chains and distributes courses by priority.
            Always verify with your academic advisor.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
