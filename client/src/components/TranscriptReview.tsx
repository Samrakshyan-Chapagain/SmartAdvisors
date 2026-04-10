import { ArrowRight, ArrowLeft } from 'lucide-react';

interface TranscriptReviewProps {
  courses: string[];
  inProgressCourses?: string[];
  onNext: () => void;
  onBack: () => void;
}

function groupByDepartment(courses: string[]): { dept: string; courses: string[] }[] {
  const map = new Map<string, string[]>();
  for (const c of courses) {
    const dept = c.split(/\s+/)[0] || c;
    if (!map.has(dept)) map.set(dept, []);
    map.get(dept)!.push(c);
  }
  return [...map.entries()]
    .map(([dept, courses]) => ({ dept, courses }))
    .sort((a, b) => b.courses.length - a.courses.length);
}

export default function TranscriptReview({ courses, inProgressCourses = [], onNext, onBack }: TranscriptReviewProps) {
  const groups = groupByDepartment(courses);
  const inProgressGroups = groupByDepartment(inProgressCourses);

  return (
    <div className="h-full font-body bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      <div className="sa-page-bg" aria-hidden />

      <div className="relative z-10 flex flex-col h-full min-h-0 overflow-y-auto scrollbar-themed">
        <div className="flex-shrink-0 px-6 py-2.5">
          <button onClick={onBack} className="flex items-center gap-2 text-[var(--sub)] hover:text-[var(--text)] transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Upload
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0" style={{ gridTemplateRows: 'minmax(0, 1fr)' }}>
          <div className="relative flex flex-col justify-center px-12 py-6 pb-8 border-r border-[var(--border)]">
            <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[rgba(91,124,250,0.3)] via-[rgba(255,107,53,0.2)] to-transparent" />
            <div className="flex flex-col gap-3 max-w-[480px]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-[1.5px] bg-[var(--blue)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--blue)]">Step 2 of 3</span>
              </div>
              <h1 className="font-heading font-extrabold text-[clamp(44px,5.5vw,58px)] leading-[0.98] tracking-[-2.5px]">
                Transcript
                <br />
                <span className="gradient-text">verified.</span>
              </h1>
              <p className="text-[16px] font-normal text-[var(--sub)] leading-[1.7] max-w-[360px]">
                We found <span className="font-bold text-[var(--blue)]">{courses.length} completed courses</span>
                {inProgressCourses.length > 0 ? (
                  <> and <span className="font-bold text-[var(--orange)]">{inProgressCourses.length} in progress</span></>
                ) : null}
                {' '}in your history. Next, tell us your preferences so we can match you with the right professors.
              </p>
              <div className="flex flex-col gap-2.5 mt-1">
                {[
                  { num: 1, name: 'Upload Transcript', desc: "Your unofficial PDF from MyMav", active: false },
                  { num: 2, name: 'Set Preferences', desc: 'Tell us what matters to you', active: true },
                  { num: 3, name: 'Get Matches', desc: 'Curated courses + professors', active: false },
                ].map((s) => (
                  <div key={s.num} className="st-item flex items-start gap-4">
                    <div
                      className="relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center min-h-0 overflow-hidden px-12 py-8">
            <div className="w-full max-w-[520px] mx-auto flex flex-col gap-6">
              <div className="pb-1 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-heading font-bold text-xl tracking-[-0.3px] text-[var(--text)]">Transcript verified</h3>
                <p className="text-[var(--sub)] mt-1 text-[15px]">
                  <span className="font-semibold text-[var(--blue)]">{courses.length} completed</span>
                  {inProgressCourses.length > 0 ? <> and <span className="font-semibold text-[var(--orange)]">{inProgressCourses.length} in progress</span></> : null}
                </p>
              </div>

              <div className="flex flex-col min-h-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--sub)] mb-4">Completed courses</p>
                {courses.length > 0 ? (
                  <div className="flex flex-col gap-5 overflow-y-auto scrollbar-themed pr-1 max-h-[320px]">
                    {groups.map(({ dept, courses: deptCourses }) => (
                      <div key={dept} className="flex flex-col gap-2">
                        <span className="text-[12px] font-semibold text-[var(--blue)]">{dept} ({deptCourses.length})</span>
                        <div className="flex flex-wrap gap-2">
                          {deptCourses.map((course) => (
                            <span
                              key={course}
                              className="py-1.5 px-2.5 rounded-lg text-[13px] font-medium text-[var(--text)]"
                              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)' }}
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--sub)] text-sm italic">No courses found.</p>
                )}

                {inProgressCourses.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--sub)] mb-4">In progress</p>
                    <div className="flex flex-col gap-5 overflow-y-auto scrollbar-themed pr-1 max-h-[200px]">
                      {inProgressGroups.map(({ dept, courses: deptCourses }) => (
                        <div key={dept} className="flex flex-col gap-2">
                          <span className="text-[12px] font-semibold text-[var(--orange)]">{dept} ({deptCourses.length})</span>
                          <div className="flex flex-wrap gap-2">
                            {deptCourses.map((course) => (
                              <span
                                key={course}
                                className="py-1.5 px-2.5 rounded-lg text-[13px] font-medium text-[var(--text)]"
                                style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.18)' }}
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onNext}
                className="relative w-full py-3.5 rounded-xl font-heading font-bold text-[15px] tracking-[-0.3px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] group overflow-hidden hover:-translate-y-0.5 hover:opacity-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--blue), var(--blue2), var(--orange2))',
                  boxShadow: '0 4px 28px rgba(91,124,250,0.25), 0 2px 12px rgba(255,107,53,0.15)',
                }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent 60%)' }} />
                <span className="relative z-10">Continue to Preferences</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
