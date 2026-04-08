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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="max-w-lg w-full bg-[#0F172A] border border-white/15 rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-[#FF8040]/15 border border-[#FF8040]/30 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-[#FF8040]" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Before You Begin</h2>

          <p className="text-white/60 text-sm leading-relaxed mb-6">
            All professor ratings, reviews, and statistics displayed in this app are sourced from{' '}
            <span className="text-white/80 font-semibold inline-flex items-center gap-1">
              RateMyProfessors
              <ExternalLink className="w-3 h-3" />
            </span>.
            This data may not be fully accurate or up to date.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <p className="text-white/50 text-xs leading-relaxed">
              You are ultimately responsible for verifying all course and professor information before making any enrollment decisions. SmartAdvisors is a planning tool — always confirm details with your academic advisor and official university resources.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
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
            className="w-full py-4 bg-[#FF8040] hover:bg-[#ff925c] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#FF8040]/20 transition-colors"
          >
            Got It, Let's Go
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
