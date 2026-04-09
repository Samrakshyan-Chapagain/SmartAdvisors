import { ShieldCheck, ExternalLink, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(91,124,250,0.12), transparent 60%), rgba(10,11,20,0.95)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="max-w-lg w-full bg-[#13152a]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-[#5b7cfa]/15 border border-[#5b7cfa]/30 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-[#5b7cfa]" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Before You Begin</h2>

          <p className="text-white/60 text-sm leading-relaxed mb-6">
            All professor ratings, reviews, and statistics displayed in this app are sourced from{' '}
            <span className="text-[#FF8040] font-semibold inline-flex items-center gap-1">
              RateMyProfessors
              <ExternalLink className="w-3 h-3" />
            </span>.
            This data may not be fully accurate or up to date.
          </p>

          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mb-4">
            <p className="text-white/50 text-xs leading-relaxed">
              You are ultimately responsible for verifying all course and professor information before making any enrollment decisions. SmartAdvisors is a planning tool — always confirm details with your academic advisor and official university resources.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-xs">Your Privacy</span>
            </div>
            <ul className="text-white/50 text-xs leading-relaxed space-y-1.5">
              <li>Your unofficial transcript PDF is parsed and immediately deleted — we never store it</li>
              <li>We only use your course list and major to generate recommendations</li>
              <li>If you sign in with Google, your name and email are stored in your browser only — never on our servers</li>
              <li>Your degree plan is saved locally in your browser and is never uploaded</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAccept}
            className="w-full py-4 bg-gradient-to-r from-[#5b7cfa] to-[#FF8040] hover:opacity-90 text-white font-bold text-lg rounded-xl shadow-lg shadow-[#5b7cfa]/20 transition-all"
          >
            Got It, Let's Go
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
