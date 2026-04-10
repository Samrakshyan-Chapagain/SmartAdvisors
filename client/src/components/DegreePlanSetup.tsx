import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Loader2, Check, Sparkles, AlertCircle, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProcessingOverlay from './ProcessingOverlay';

interface EligibleCourse {
  code: string;
  name: string;
  creditHours: number;
  requirement: string;
}

interface ElectiveCourse {
  code: string;
  name: string;
  creditHours: number;
  taken?: boolean;
  isEligible?: boolean;
  missingPrereqs?: string[];
}

interface ElectiveGroup {
  group: string;
  hoursRequired: number;
  hoursCompleted?: number;
  courses: ElectiveCourse[];
}

interface DegreePlanSetupProps {
  completedCourses: string[];
  inProgressCourses?: string[];
  department: string;
  onPlanGenerated: (
    creditsPerSemester: number,
    selectedCourses: string[],
    startSemester: string,
    startYear: number,
    includeSummer: boolean,
    chosenElectives: string[]
  ) => void;
  isLoading: boolean;
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const CREDIT_OPTIONS = [12, 13, 14, 15, 16, 17, 18];
const SEMESTER_OPTIONS = ['Fall', 'Spring', 'Summer'];
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];

function getSuggestedSemester(): { semester: string; year: number } {
  const month = new Date().getMonth() + 1; // 1-based
  const year = new Date().getFullYear();
  // Aug–Dec: next semester is Spring of next year
  if (month >= 8) return { semester: 'Spring', year: year + 1 };
  // Jan–Jul: next semester is Fall of this year
  return { semester: 'Fall', year };
}

export default function DegreePlanSetup({ completedCourses, inProgressCourses = [], department, onPlanGenerated, isLoading, onBack }: DegreePlanSetupProps) {
  const suggested = getSuggestedSemester();

  const [creditsPerSemester, setCreditsPerSemester] = useState(15);
  const [startSemester, setStartSemester] = useState(suggested.semester);
  const [startYear, setStartYear] = useState(suggested.year);
  const [includeSummer, setIncludeSummer] = useState(false);
  const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [stats, setStats] = useState<{ totalCourses: number; totalHours: number; completedCourses: number; completedHours: number } | null>(null);
  const [, setAllElectives] = useState<ElectiveCourse[]>([]);
  const [electiveGroups, setElectiveGroups] = useState<ElectiveGroup[]>([]);
  const [chosenElectives, setChosenElectives] = useState<Set<string>>(new Set());

  // Fetch eligible courses on mount
  useEffect(() => {
    const fetchEligible = async () => {
      try {
        const response = await fetch(`${API_URL}/api/degree-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completed_courses: completedCourses,
            in_progress_courses: inProgressCourses,
            department,
            credits_per_semester: creditsPerSemester,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setEligibleCourses(data.eligibleCourses || []);
          setStats(data.stats || null);
          setAllElectives(data.allElectives || []);
          setElectiveGroups(data.electiveGroups || []);
        }
      } catch (err) {
        console.error('Failed to fetch eligible courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchEligible();
  }, [completedCourses, department]);

  const selectedHours = Array.from(selectedCourses).reduce((sum, code) => {
    const course = eligibleCourses.find(c => c.code === code);
    return sum + (course?.creditHours || 0);
  }, 0);

  const toggleCourse = (code: string) => {
    setSelectedCourses(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleElective = (course: ElectiveCourse) => {
    if (course.taken || course.isEligible === false) return;
    setChosenElectives(prev => {
      const next = new Set(prev);
      if (next.has(course.code)) next.delete(course.code);
      else next.add(course.code);
      return next;
    });
  };

  const electivesPicked = chosenElectives.size;

  // Calculate hours per elective group (taken + selected)
  const selectedHoursByGroup: Record<string, number> = {};
  for (const group of electiveGroups) {
    let hrs = group.hoursCompleted || 0; // start with taken hours
    for (const c of group.courses) {
      if (!c.taken && chosenElectives.has(c.code)) hrs += c.creditHours;
    }
    selectedHoursByGroup[group.group] = hrs;
  }

  // Check if all groups are satisfied
  const allGroupsSatisfied = electiveGroups.length === 0 || electiveGroups.every(
    g => g.hoursRequired === 0 || selectedHoursByGroup[g.group] >= g.hoursRequired
  );

  // Format group name for display
  const formatGroupName = (name: string) =>
    name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const requiredCourses = eligibleCourses.filter(c => c.requirement === 'required');
  const electiveCourses = eligibleCourses.filter(
    c => c.requirement === 'elective' && chosenElectives.has(c.code)
  );

  const overTarget = selectedHours > creditsPerSemester + 1;
  const atTarget = selectedHours >= creditsPerSemester - 1 && selectedHours <= creditsPerSemester + 1;

  const remainingHours = stats ? stats.totalHours - stats.completedHours : 0;
  const estimatedSemesters = remainingHours > 0 ? Math.ceil(remainingHours / creditsPerSemester) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <ProcessingOverlay
        isVisible={isLoading}
        title="Building Your Degree Plan"
        steps={['Checking prerequisites...', 'Scheduling courses by priority...', 'Finding top professors...', 'Finalizing your plan...']}
        icon="plan"
      />
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Review
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          Plan Your Degree <Sparkles className="w-8 h-8 text-[#FF8040] fill-[#FF8040]" />
        </h2>
        <p className="text-white/60 text-lg">
          Choose your pace and pick courses for next semester. We'll plan the rest.
        </p>
      </motion.div>

      {/* Progress summary */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 mb-8 text-sm"
        >
          <span className="flex items-center gap-1.5 bg-[#0046FF]/10 border border-[#0046FF]/20 text-blue-300 font-semibold px-3 py-1.5 rounded-full">
            {stats.completedCourses}/{stats.totalCourses} courses done
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 font-semibold px-3 py-1.5 rounded-full">
            {stats.completedHours}/{stats.totalHours} credit hours
          </span>
          <span className="flex items-center gap-1.5 bg-[#FF8040]/10 border border-[#FF8040]/20 text-orange-300 font-semibold px-3 py-1.5 rounded-full">
            ~{estimatedSemesters} semesters left
          </span>
        </motion.div>
      )}

      {/* Choose Your Electives — grouped by elective type */}
      {!loadingCourses && electiveGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF8040] p-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Choose Your Electives</h3>
                <p className="text-white/40 text-sm">Select electives from each group to meet your degree requirements.</p>
              </div>
            </div>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${
              allGroupsSatisfied
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-[#FF8040] bg-[#FF8040]/10 border-[#FF8040]/20'
            }`}>
              {allGroupsSatisfied ? 'All groups satisfied' : `${electivesPicked} selected`}
            </span>
          </div>

          <div className="space-y-6">
            {electiveGroups.map(group => {
              const groupHrs = selectedHoursByGroup[group.group] || 0;
              const takenHrs = group.hoursCompleted || 0;
              const isSatisfied = group.hoursRequired > 0 && groupHrs >= group.hoursRequired;
              const takenPct = group.hoursRequired > 0 ? Math.min(100, (takenHrs / group.hoursRequired) * 100) : 0;
              const selectedPct = group.hoursRequired > 0 ? Math.min(100 - takenPct, ((groupHrs - takenHrs) / group.hoursRequired) * 100) : 0;
              return (
                <div key={group.group}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full bg-[#FF8040]" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {formatGroupName(group.group)} Electives
                    </h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isSatisfied
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-white/40 bg-white/5 border-white/10'
                    }`}>
                      {groupHrs}/{group.hoursRequired} hrs
                    </span>
                    {takenHrs > 0 && (
                      <span className="text-xs text-emerald-400/70 font-semibold">
                        ({takenHrs} taken)
                      </span>
                    )}
                  </div>
                  {group.hoursRequired > 0 && (
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 flex">
                      {takenPct > 0 && (
                        <motion.div
                          className="h-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${takenPct}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      {selectedPct > 0 && (
                        <motion.div
                          className="h-full bg-[#FF8040]"
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedPct}%` }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        />
                      )}
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-2">
                    {group.courses.map(elective => (
                      elective.taken ? (
                        <div
                          key={elective.code}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 opacity-60 cursor-default"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-sm">{elective.code}</span>
                              <span className="text-white/30 text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                {elective.creditHours} hrs
                              </span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Taken
                              </span>
                            </div>
                            <p className="text-white/35 text-xs truncate mt-0.5">{elective.name}</p>
                          </div>
                        </div>
                      ) : (
                        <motion.button
                          key={elective.code}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleElective(elective)}
                          disabled={elective.isEligible === false}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            elective.isEligible === false
                              ? 'border-red-500/20 bg-red-500/5 opacity-65 cursor-not-allowed'
                              : chosenElectives.has(elective.code)
                              ? 'border-[#FF8040]/50 bg-[#FF8040]/10 shadow-sm'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              elective.isEligible === false
                                ? 'border-red-400/40 bg-transparent'
                                : chosenElectives.has(elective.code) ? 'border-transparent bg-[#FF8040]' : 'border-white/20'
                            }`}
                          >
                            <AnimatePresence>
                              {elective.isEligible !== false && chosenElectives.has(elective.code) && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-sm">{elective.code}</span>
                              <span className="text-white/30 text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                {elective.creditHours} hrs
                              </span>
                              {elective.isEligible === false && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/25">
                                  Ineligible
                                </span>
                              )}
                            </div>
                            <p className="text-white/45 text-xs truncate mt-0.5">{elective.name}</p>
                            {elective.isEligible === false && elective.missingPrereqs?.length ? (
                              <p className="text-red-300/80 text-[11px] mt-1">
                                Missing: {elective.missingPrereqs.join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </motion.button>
                      )
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Semester Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: electiveGroups.length > 0 ? 0.18 : 0.12 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-[#FF8040] p-2 rounded-xl">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Semester Options</h3>
            <p className="text-white/40 text-sm">When do you want to start planning from?</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 items-end">
          {/* Start semester + year */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Start planning from</p>
            <div className="flex gap-2 flex-wrap">
              {SEMESTER_OPTIONS.map(sem => (
                <button
                  key={sem}
                  onClick={() => setStartSemester(sem)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    startSemester === sem
                      ? 'bg-[#FF8040] border-[#FF8040] text-white shadow-lg shadow-[#FF8040]/20'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {sem}
                </button>
              ))}
              <select
                value={startYear}
                onChange={e => setStartYear(Number(e.target.value))}
                aria-label="Select start year"
                title="Select start year"
                className="bg-white/5 border border-white/10 text-white/80 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-white/30 cursor-pointer"
              >
                {YEAR_OPTIONS.map(yr => (
                  <option key={yr} value={yr} className="bg-[#0a0a1a] text-white">{yr}</option>
                ))}
              </select>
            </div>
            <p className="text-white/30 text-xs mt-2">
              Planning from: <span className="text-[#FF8040] font-semibold">{startSemester} {startYear}</span>
            </p>
          </div>

          {/* Summer toggle */}
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => setIncludeSummer(prev => !prev)}
              aria-label={includeSummer ? 'Disable summer semesters' : 'Enable summer semesters'}
              title={includeSummer ? 'Disable summer semesters' : 'Enable summer semesters'}
              className={`relative w-11 h-6 rounded-full transition-colors border flex-shrink-0 ${
                includeSummer ? 'bg-[#0046FF] border-[#0046FF]' : 'bg-white/10 border-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  includeSummer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <p className="text-white/70 text-sm font-semibold">Include summer semesters</p>
              <p className="text-white/30 text-xs">{includeSummer ? 'Summer semesters will be included' : 'Skipping summers'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credit hours picker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#0046FF] p-2 rounded-xl">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Credit Hours Per Semester</h3>
            <p className="text-white/40 text-sm">How many hours do you want to take each semester?</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {CREDIT_OPTIONS.map(hrs => (
            <button
              key={hrs}
              onClick={() => setCreditsPerSemester(hrs)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                creditsPerSemester === hrs
                  ? 'bg-[#0046FF] border-[#0046FF] text-white shadow-lg shadow-[#0046FF]/20'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {hrs} hrs
            </button>
          ))}
        </div>

        {creditsPerSemester < 12 && (
          <p className="text-amber-400 text-xs mt-3 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Less than 12 hours may affect financial aid eligibility
          </p>
        )}
      </motion.div>

      {/* Course selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF8040] p-2 rounded-xl">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pick Courses for {startSemester} {startYear}</h3>
              <p className="text-white/40 text-sm">Select what you want to take next. We'll schedule the rest automatically.</p>
            </div>
          </div>
        </div>

        {/* Running total bar */}
        <div className="mb-5 bg-black/20 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm font-semibold">Selected Hours</span>
            <span className={`text-sm font-bold ${overTarget ? 'text-red-400' : atTarget ? 'text-emerald-400' : 'text-white/80'}`}>
              {selectedHours} / {creditsPerSemester} hrs
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${overTarget ? 'bg-red-500' : atTarget ? 'bg-emerald-500' : 'bg-[#0046FF]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (selectedHours / creditsPerSemester) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {overTarget && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Over your target — consider removing a course
            </p>
          )}
        </div>

        {loadingCourses ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : (
          <>
            {/* Required courses */}
            {requiredCourses.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-[#0046FF]" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Required Courses</h4>
                  <span className="text-xs text-white/40 bg-[#0046FF]/10 border border-[#0046FF]/20 px-2 py-0.5 rounded-full font-semibold">
                    {requiredCourses.length} courses
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {requiredCourses.map(course => (
                    <CoursePickCard
                      key={course.code}
                      course={course}
                      selected={selectedCourses.has(course.code)}
                      onToggle={() => toggleCourse(course.code)}
                      accent="#0046FF"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Elective courses */}
            {electiveCourses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-[#FF8040]" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Elective Courses</h4>
                  <span className="text-xs text-white/40 bg-[#FF8040]/10 border border-[#FF8040]/20 px-2 py-0.5 rounded-full font-semibold">
                    {electiveCourses.length} courses
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {electiveCourses.map(course => (
                    <CoursePickCard
                      key={course.code}
                      course={course}
                      selected={selectedCourses.has(course.code)}
                      onToggle={() => toggleCourse(course.code)}
                      accent="#FF8040"
                    />
                  ))}
                </div>
              </div>
            )}

            {eligibleCourses.length === 0 && remainingHours <= 0 && (
              <div className="text-center py-10">
                <GraduationCap className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-emerald-400 font-bold text-lg mb-2">You've completed all your degree courses!</p>
                <p className="text-white/40 text-sm">There are no remaining courses to plan. Congratulations!</p>
              </div>
            )}
            {eligibleCourses.length === 0 && remainingHours > 0 && (
              <p className="text-center text-white/40 py-8">No eligible courses found — check your transcript and degree selection.</p>
            )}
          </>
        )}
      </motion.div>

      {/* Generate button */}
      {!(eligibleCourses.length === 0 && remainingHours <= 0) && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPlanGenerated(creditsPerSemester, Array.from(selectedCourses), startSemester, startYear, includeSummer, Array.from(chosenElectives))}
          disabled={isLoading || (electiveGroups.length > 0 && !allGroupsSatisfied)}
          className="inline-flex items-center gap-3 px-10 py-4 bg-[#FF8040] hover:bg-[#ff925c] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#FF8040]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Generating Plan...
            </>
          ) : (
            <>
              Plan My Degree <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
        <p className="text-white/30 text-xs mt-3">
          {electiveGroups.length > 0 && !allGroupsSatisfied
            ? 'Select electives to meet all group requirements above'
            : selectedCourses.size === 0
              ? "We'll auto-pick the best courses for each semester"
              : `${selectedCourses.size} courses selected for ${startSemester} ${startYear}`}
        </p>
      </motion.div>
      )}
    </div>
  );
}

function CoursePickCard({ course, selected, onToggle, accent }: {
  course: EligibleCourse;
  selected: boolean;
  onToggle: () => void;
  accent: string;
}) {
  const isBlueAccent = accent === '#0046FF';
  const selectedCardClass = isBlueAccent
    ? 'border-[#0046FF]/50 bg-[#0046FF]/10 shadow-sm'
    : 'border-[#FF8040]/50 bg-[#FF8040]/10 shadow-sm';
  const selectedDotClass = isBlueAccent ? 'bg-[#0046FF]' : 'bg-[#FF8040]';
  const badgeClass = isBlueAccent
    ? 'text-[#0046FF] bg-[#0046FF]/10 border border-[#0046FF]/25'
    : 'text-[#FF8040] bg-[#FF8040]/10 border border-[#FF8040]/25';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        selected
          ? selectedCardClass
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
      }`}
    >
      {/* Check circle */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? `border-transparent ${selectedDotClass}` : 'border-white/20'
        }`}
      >
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Course info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-bold text-sm">{course.code}</span>
          <span className="text-white/30 text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
            {course.creditHours} hrs
          </span>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${badgeClass}`}
          >
            {course.requirement === 'required' ? 'Required' : 'Elective'}
          </span>
        </div>
        <p className="text-white/45 text-xs truncate mt-0.5">{course.name}</p>
      </div>
    </motion.button>
  );
}
