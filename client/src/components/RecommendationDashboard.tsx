import { useState, useEffect, useRef } from 'react';
import { Star, TrendingUp, BookOpen, Loader2, Sparkles, ArrowLeft, Trophy, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type PreferencesType = {
  extraCredit: boolean;
  clearGrading: boolean;
  goodFeedback: boolean;
  caring: boolean;
  lectureHeavy: boolean;
  groupProjects: boolean;
  avoidTestHeavy: boolean;
  avoidHomeworkHeavy: boolean;
  avoidStrictAttendance: boolean;
  avoidPopQuizzes: boolean;
};

interface Professor {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  difficulty: string;
  matchScore: number;
  wouldTakeAgain?: string | null;
  schedule: string;
  classSize: string;
  assessmentType: string;
  attendance: string;
  tags: string[];
}

interface ClassData {
  courseCode: string;
  courseName: string;
  creditHours?: number;
  corequisites?: string;
  professors: Professor[];
}

interface ProgressStats {
  totalRequiredCourses: number;
  totalRequiredHours: number;
  completedRequiredCourses: number;
  completedRequiredHours: number;
  totalElectiveSlots: number;
  totalElectiveHours: number;
  completedElectives: number;
  completedElectiveHours: number;
  remainingElectiveSlots: number;
}

interface RecommendationDashboardProps {
  userData: {
    preferences: PreferencesType;
    recommendations: ClassData[];
    electiveRecommendations?: ClassData[];
    stats?: ProgressStats;
  };
  onBack: () => void;
}

function CourseCard({ classData, index, getDifficultyColor, getTagStyle, accentColor }: {
  classData: ClassData;
  index: number;
  getDifficultyColor: (d: string) => string;
  getTagStyle: (t: string) => string;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-96 bg-white/[0.04] backdrop-blur-md rounded-3xl shadow-xl border border-white/15 overflow-hidden flex flex-col max-h-[80vh] print-card"
    >
      <div className="px-6 py-5 border-b border-white/15 flex-shrink-0" style={{ background: `${accentColor}20` }}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{classData.courseCode}</h3>
            {classData.creditHours && (
              <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                {classData.creditHours} hrs
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-white px-2 py-1 rounded-full border border-white/10" style={{ background: accentColor }}>
            {classData.professors.length} Options
          </span>
        </div>
        <p className="text-white/60 font-medium text-sm truncate" title={classData.courseName}>
          {classData.courseName}
        </p>
        {classData.corequisites && (
          <p className="text-amber-400/70 text-xs mt-1 font-medium">
            Co-req: {classData.corequisites}
          </p>
        )}
      </div>
      <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-grow print-prof-list">
        {classData.professors.map((professor, profIndex) => {
          const isBestMatch = profIndex === 0;
          return (
            <motion.div
              key={professor.id}
              whileHover={{ y: -2 }}
              className={`
                relative rounded-2xl p-5 transition-all group border
                ${isBestMatch
                  ? 'bg-[#FF8040]/15 border-[#FF8040]/70 shadow-lg shadow-[#FF8040]/15 z-10 scale-[1.02]'
                  : 'bg-white/[0.06] border-white/15 hover:border-[#0046FF]/60 hover:bg-[#0046FF]/15'
                }
              `}
            >
              {isBestMatch && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF8040] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border-2 border-[#001BB7] z-20">
                  <Trophy className="w-3 h-3 fill-white" /> Top Match
                </div>
              )}
              <div className="flex items-start justify-between mb-3 mt-1">
                <div className="w-full">
                  <h4 className="font-bold text-white text-lg leading-tight mb-2 truncate" title={professor.name}>
                    {professor.name}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-sm font-bold border ${professor.rating > 0 ? 'bg-[#FF8040]/20 text-[#FF8040] border-[#FF8040]/30' : 'bg-white/10 text-white/40 border-white/10'}`}>
                      <Star className={`w-3.5 h-3.5 ${professor.rating > 0 ? 'fill-[#FF8040] text-[#FF8040]' : 'text-gray-500'}`} />
                      {professor.rating > 0 ? professor.rating : "N/A"}
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${getDifficultyColor(professor.difficulty)}`}>
                      Diff: {professor.difficulty}
                    </span>
                    {professor.wouldTakeAgain && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold border bg-emerald-900/30 text-emerald-300 border-emerald-800/50">
                        {professor.wouldTakeAgain} retake
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {professor.tags && professor.tags.length > 0 ? (
                  professor.tags.slice(0, 4).map((tag, i) => (
                    <span key={i} className={`px-2 py-1 rounded-md text-[11px] font-bold border ${getTagStyle(tag)}`}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-white/30 italic py-1">No attributes</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function RecommendationDashboard({ userData, onBack }: RecommendationDashboardProps) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [electiveClasses, setElectiveClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const electivesRef = useRef<HTMLDivElement>(null);

  const scrollToElectives = () => {
    electivesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (userData?.recommendations) {
      setClasses(userData.recommendations);
      setElectiveClasses(userData.electiveRecommendations || []);
      setIsLoading(false);
    }
  }, [userData]);

  const visibleClasses = classes.filter((c) => c.professors.length > 0);
  const visibleElectives = electiveClasses.filter((c) => c.professors.length > 0);

  const totalCourses = visibleClasses.length + visibleElectives.length;
  const totalProfessors = visibleClasses.reduce((sum, c) => sum + c.professors.length, 0) + visibleElectives.reduce((sum, c) => sum + c.professors.length, 0);

  // --- DARK MODE COLORS ---
  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return 'text-slate-300 bg-slate-800/50 border-slate-700';
    const d = difficulty.toLowerCase();
    if (d.includes('easy')) return 'text-emerald-300 bg-emerald-900/40 border-emerald-800';
    if (d.includes('medium') || d.includes('moderate')) return 'text-amber-300 bg-amber-900/40 border-amber-800';
    if (d.includes('hard') || d.includes('challenging')) return 'text-rose-300 bg-rose-900/40 border-rose-800';
    return 'text-slate-300 bg-slate-800/50 border-slate-700';
  };

  const getTagStyle = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('easy') || t.includes('amazing') || t.includes('respected') || t.includes('clear') || t.includes('extra')) {
      return 'bg-[#0046FF]/20 text-blue-200 border-[#0046FF]/30';
    }
    if (t.includes('tough') || t.includes('heavy') || t.includes('strict') || t.includes('pop')) {
      return 'bg-[#FF8040]/20 text-orange-200 border-[#FF8040]/30';
    }
    return 'bg-white/5 text-slate-300 border-white/10';
  };

  // --- PRINT FUNCTION ---
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80 font-medium text-lg">Curating your perfect schedule...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* --- PRINT STYLES (Forces Landscape & Horizontal Layout) --- */}
      <style>{`
        @media print {
          @page { 
            size: landscape; 
            margin: 10mm; 
          }

          /* Reset everything for print */
          * {
            box-sizing: border-box !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          /* Hide all UI elements */
          button, nav, .no-print,
          .grid.grid-cols-1.md\\:grid-cols-2,
          .text-center.text-sm.text-white {
            display: none !important;
          }

          /* Main wrapper */
          .max-w-7xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Header */
          .mb-10.text-center {
            margin-bottom: 15px !important;
          }

          .mb-10.text-center * {
            color: black !important;
          }

          /* Container for horizontal scroll */
          .overflow-x-auto {
            overflow: visible !important;
            padding: 0 !important;
          }

          /* MAIN GRID: Classes in rows of 2 */
          .flex.gap-8 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 15px !important;
            padding: 0 !important;
          }

          /* Individual class card */
          .flex-shrink-0 {
            width: 100% !important;
            flex-shrink: 1 !important;
            background: white !important;
            border: 2px solid black !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            max-height: none !important;
          }

          /* Class header */
          .flex-shrink-0 > div:first-child {
            background: #e8e8e8 !important;
            border-bottom: 1px solid black !important;
            padding: 10px !important;
          }

          .flex-shrink-0 > div:first-child h3,
          .flex-shrink-0 > div:first-child p,
          .flex-shrink-0 > div:first-child span {
            color: black !important;
            background: transparent !important;
          }

          /* Professor list container */
          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            padding: 10px !important;
          }

          /* Individual professor card */
          .overflow-y-auto > div {
            background: white !important;
            border: 1.5px solid #666 !important;
            border-radius: 6px !important;
            padding: 8px !important;
            margin: 0 !important;
            transform: none !important;
            scale: 1 !important;
          }

          /* Remove trophy badge */
          .overflow-y-auto > div > div.absolute {
            display: none !important;
          }

          /* All text in professor cards */
          .overflow-y-auto h4,
          .overflow-y-auto span,
          .overflow-y-auto div,
          .overflow-y-auto p {
            color: black !important;
            background: transparent !important;
            border-color: #999 !important;
          }

          /* Professor name */
          .overflow-y-auto h4 {
            font-size: 13px !important;
            font-weight: bold !important;
            margin-bottom: 4px !important;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
          }

          /* Rating and difficulty badges */
          .overflow-y-auto .flex.items-center span {
            font-size: 10px !important;
            padding: 2px 5px !important;
            border: 1px solid #666 !important;
            margin: 2px !important;
          }

          /* Tags */
          .overflow-y-auto .flex.flex-wrap span {
            font-size: 9px !important;
            padding: 2px 5px !important;
            border: 1px solid #999 !important;
            margin: 2px !important;
            background: white !important;
          }

          /* Icons - make small and simple */
          svg {
            width: 10px !important;
            height: 10px !important;
            stroke: black !important;
            fill: none !important;
          }

          /* Hide framer-motion attributes */
          [class*="motion"] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* TOP CONTROLS */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Preferences
        </button>

        {/* PRINT BUTTON */}
        <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#0046FF] hover:bg-[#0036CC] text-white px-4 py-2 rounded-xl shadow-lg transition-all font-bold"
        >
            <Download className="w-4 h-4" /> Save as PDF
        </button>
      </div>

      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          Your Recommendations <Sparkles className="w-8 h-8 text-[#FF8040] fill-[#FF8040]" />
        </h2>
        <p className="text-white/80 text-xl font-medium">
          Found <span className="font-bold text-[#FF8040]">{totalProfessors} professors</span> across <span className="font-bold text-white">{totalCourses} courses</span>.
        </p>
      </motion.div>

      {/* Compact Stats Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 text-sm">
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 font-semibold px-3 py-1.5 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> {totalCourses} courses
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70 font-semibold px-3 py-1.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" /> {totalProfessors} professors
          </span>
          {userData.stats && (
            <>
              <span className="flex items-center gap-1.5 bg-[#0046FF]/10 border border-[#0046FF]/20 text-blue-300 font-semibold px-3 py-1.5 rounded-full">
                {userData.stats.completedRequiredCourses}/{userData.stats.totalRequiredCourses} required done
              </span>
              <span className="flex items-center gap-1.5 bg-[#FF8040]/10 border border-[#FF8040]/20 text-orange-300 font-semibold px-3 py-1.5 rounded-full">
                {userData.stats.completedElectives}/{userData.stats.totalElectiveSlots} electives done
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/50 font-semibold px-3 py-1.5 rounded-full">
                {userData.stats.completedRequiredHours + userData.stats.completedElectiveHours}/{userData.stats.totalRequiredHours + userData.stats.totalElectiveHours} credit hours
              </span>
            </>
          )}
      </div>

      {/* ── ELECTIVES JUMP BANNER (at top, before everything) ── */}
      {visibleElectives.length > 0 && (
        <motion.button
          onClick={scrollToElectives}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full mb-10 rounded-2xl border border-[#FF8040]/30 bg-[#FF8040]/10 hover:bg-[#FF8040]/15 transition-all cursor-pointer focus:outline-none no-print"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#FF8040] p-2.5 rounded-xl flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-base">
                  You also have{' '}
                  <span className="text-[#FF8040]">{visibleElectives.length} elective courses</span>{' '}
                  to choose from
                </p>
                {userData.stats && userData.stats.remainingElectiveSlots > 0 && (
                  <p className="text-white/50 text-sm mt-0.5">
                    Pick <span className="text-[#FF8040] font-bold">{userData.stats.remainingElectiveSlots}</span> more to complete your elective requirement
                  </p>
                )}
                {userData.stats && userData.stats.remainingElectiveSlots === 0 && (
                  <p className="text-emerald-400 text-sm font-medium mt-0.5">All elective slots filled — explore options below</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#FF8040] font-bold text-sm flex-shrink-0">
              Jump to electives <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.button>
      )}

      {visibleClasses.length === 0 && visibleElectives.length === 0 ? (
          <div className="text-center py-20">
              <p className="text-white/60 text-lg">No classes found matching your criteria.</p>
          </div>
      ) : (
        <>
          {/* ── REQUIRED COURSES ── */}
          {visibleClasses.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-[#0046FF] p-2 rounded-xl">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Required Courses</h3>
                <span className="text-sm font-bold text-white/50 bg-white/10 px-3 py-1 rounded-full">{visibleClasses.length} courses</span>
              </div>
              <p className="text-white/40 text-sm ml-12 mb-1">
                Based on your transcript, these are the required courses you're eligible to take next.
              </p>
              {userData.stats && (
                <p className="text-white/50 text-sm ml-12 mb-4">
                  Completed <span className="text-white font-bold">{userData.stats.completedRequiredCourses}/{userData.stats.totalRequiredCourses}</span> required courses ({userData.stats.completedRequiredHours}/{userData.stats.totalRequiredHours} credit hours)
                </p>
              )}
              <div className="overflow-x-auto pb-6 no-scrollbar">
                <div className="flex gap-8 min-w-min px-2 print-horizontal-container">
                  {visibleClasses.map((classData, index) => (
                    <CourseCard key={classData.courseCode} classData={classData} index={index} getDifficultyColor={getDifficultyColor} getTagStyle={getTagStyle} accentColor="#0046FF" />
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-white/30 font-medium mt-1">Scroll right to see all required courses →</p>
            </div>
          )}

          {/* ── ELECTIVE COURSES ── */}
          {visibleElectives.length > 0 && (
            <div className="mb-10" ref={electivesRef} style={{ scrollMarginTop: '5rem' }}>
              {/* Big prominent header */}
              <div className="rounded-2xl bg-[#FF8040]/10 border border-[#FF8040]/25 px-6 py-5 mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-[#FF8040] p-2 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Elective Options</h3>
                  <span className="text-sm font-bold text-[#FF8040] bg-[#FF8040]/20 border border-[#FF8040]/30 px-3 py-1 rounded-full">{visibleElectives.length} courses</span>
                </div>
                <p className="text-white/40 text-sm ml-12 mb-1">
                  Based on your transcript, these are the elective courses you're eligible to take.
                </p>
                {userData.stats && (
                  <p className="text-white/50 text-sm ml-12">
                    You've completed <span className="text-white font-bold">{userData.stats.completedElectives}</span> of <span className="text-white font-bold">{userData.stats.totalElectiveSlots}</span> elective slots
                    {userData.stats.remainingElectiveSlots > 0 ? (
                      <> — choose <span className="text-[#FF8040] font-bold">{userData.stats.remainingElectiveSlots}</span> more from the options below</>
                    ) : (
                      <> · <span className="text-emerald-400 font-bold">All elective slots filled!</span></>
                    )}
                  </p>
                )}
              </div>

              <div className="overflow-x-auto pb-6 no-scrollbar">
                <div className="flex gap-8 min-w-min px-2 print-horizontal-container">
                  {visibleElectives.map((classData, index) => (
                    <CourseCard key={classData.courseCode} classData={classData} index={index} getDifficultyColor={getDifficultyColor} getTagStyle={getTagStyle} accentColor="#FF8040" />
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-white/30 font-medium mt-1">Scroll right to see all elective options →</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}