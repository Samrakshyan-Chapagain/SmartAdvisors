import { ArrowRight, GraduationCap, Sparkles, Star, LogIn, Calendar, Upload, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function WelcomePage({ onGetStarted, onSignIn }: WelcomePageProps) {
  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden py-10">

      <div className="max-w-4xl mx-auto px-6 relative z-10 w-full">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF8040]/10 border border-[#FF8040]/20 text-[#FF8040] font-bold text-sm mb-7 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 fill-[#FF8040]" />
          <span className="text-white/90">For UTA Students</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.08)} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-5 leading-tight">
          Plan Your Perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8040] to-white">
            Semester
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.16)} className="text-lg md:text-xl text-white/65 mb-9 max-w-2xl mx-auto leading-relaxed font-light">
          Upload your transcript. We'll figure out what you can take next and find the best professors for each course.
        </motion.p>

        {/* How it works — 3-step visual */}
        <motion.div {...fadeUp(0.24)} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 mb-9 max-w-lg mx-auto">
          {[
            { num: '1', label: 'Upload Transcript', icon: <Upload className="w-3.5 h-3.5" /> },
            { num: '2', label: 'Set Preferences', icon: <Star className="w-3.5 h-3.5" /> },
            { num: '3', label: 'Get Matched', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-0 flex-shrink-0">
              <Step num={s.num} label={s.label} icon={s.icon} />
              {i < 2 && <div className="hidden sm:block w-6 h-px bg-white/15 flex-shrink-0 mx-1" />}
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.32)} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            className="group inline-flex items-center gap-3 px-9 py-4 bg-[#FF8040] text-white text-base font-bold rounded-2xl shadow-lg shadow-[#FF8040]/20 hover:shadow-xl hover:bg-[#ff925c] transition-colors"
          >
            Continue as Guest
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSignIn}
            className="group inline-flex items-center gap-3 px-9 py-4 bg-[#0046FF] text-white text-base font-bold rounded-2xl shadow-lg shadow-[#0046FF]/20 hover:shadow-xl hover:bg-[#1a5cff] transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </motion.button>
        </motion.div>

        <motion.p {...fadeUp(0.38)} className="text-white/35 text-sm mb-10">
          Sign in to plan your entire degree. Guests get course and professor recommendations for what to take next.
        </motion.p>

        {/* Feature cards — what each mode offers */}
        <motion.div
          {...fadeUp(0.44)}
          className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto"
        >
          {/* Guest card */}
          <div className="bg-white/[0.06] backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-[#FF8040]/40 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF8040]/15 border border-[#FF8040]/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-[#FF8040]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Guest Mode</h3>
                <p className="text-white/40 text-xs">No account needed</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              <FeatureItem text="Upload transcript & detect completed courses" />
              <FeatureItem text="See eligible classes based on prerequisites" />
              <FeatureItem text="Get professor recommendations matched to your style" />
            </ul>
          </div>

          {/* Signed-in card */}
          <div className="bg-white/[0.06] backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-[#0046FF]/40 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0046FF]/15 border border-[#0046FF]/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#0046FF]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Degree Planning</h3>
                <p className="text-white/40 text-xs">Sign in required</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              <FeatureItem text="Everything in guest mode, plus..." accent />
              <FeatureItem text="Pick your courses & set credit hours per semester" accent />
              <FeatureItem text="Auto-generate a full semester-by-semester degree plan" accent />
            </ul>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-2 mt-8 text-xs text-white/30"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Built for UTA students</span>
        </motion.div>

      </div>
    </div>
  );
}

function Step({ num, label, icon }: { num: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] flex-shrink-0">
      <div className="w-5 h-5 rounded-full bg-[#FF8040]/25 text-[#FF8040] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {num}
      </div>
      <span className="text-white/55 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
        {icon} {label}
      </span>
    </div>
  );
}

function FeatureItem({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accent ? 'text-[#0046FF]/70' : 'text-[#FF8040]/60'}`} />
      <span className="text-white/60 text-sm">{text}</span>
    </li>
  );
}
