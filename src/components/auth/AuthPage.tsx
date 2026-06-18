import React, { useState } from 'react';
import { useAuth } from '../../store/contexts/AuthContext';
import { ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured } from '../../services/supabase';

export const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isLogin) {
      const res = await signIn(email, password);
      if (res.error) setError(res.error);
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError('Name is required.');
        setLoading(false);
        return;
      }
      const res = await signUp(email, password, name);
      if (res.error) {
        setError(res.error);
      } else {
        // Force switch to login or show success message depending on Supabase email confirmation settings
        setError('Account created. You can now sign in (or check your email for confirmation).');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4 selection:bg-[#0099FF]/30">

      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#007ACC]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30
                          rounded-xl text-center">
            <p className="text-[10px] font-mono font-bold text-rose-400
                          uppercase tracking-wider">
              ⚠️ Configuration Required
            </p>
            <p className="text-[10px] font-mono text-rose-300/70 mt-1">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
              to your Vercel environment variables.
            </p>
          </div>
        )}

        {/* Official SpartanBet Logo — vertical version for auth */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/assets/spartan-loader.png"
            alt="SpartanBet"
            className="h-32 w-auto object-contain mb-2"
            onError={(e) => {
              // Fallback if image not found
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.removeAttribute('style');
            }}
          />
          {/* Fallback text logo (hidden by default, shown if img fails) */}
          <div style={{ display: 'none' }}
               className="flex flex-col items-center">
            <span className="text-4xl font-black text-white font-mono
                             tracking-tighter leading-none">SPARTAN</span>
            <span className="text-4xl font-black text-[#0099FF] font-mono
                             tracking-tighter leading-none">BET</span>
          </div>
          <p className="text-[10px] font-mono text-[#0099FF]/70 tracking-[0.3em]
                        uppercase mt-2">
            Sports Betting
          </p>
        </div>

        <div className="bg-[#131115] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0099FF]/50 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Spartan Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-[#0099FF]/50 focus:bg-white/10 transition-all font-mono outline-none"
                    placeholder="Leonidas"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-[#0099FF]/50 focus:bg-white/10 transition-all font-mono outline-none"
                placeholder="spartan@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-[#0099FF]/50 focus:bg-white/10 transition-all font-mono outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-[#0099FF]/50 focus:bg-white/10 transition-all font-mono outline-none"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
              >
                <p className="text-[10px] font-bold font-mono text-rose-400 text-center">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-[#007ACC] hover:bg-[#0099FF] disabled:opacity-50 disabled:cursor-wait text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,153,255,0.2)] hover:shadow-[0_0_25px_rgba(0,153,255,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              ) : (
                <>
                  {isLogin ? 'Enter the HQ' : 'Join the Ranks'}
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-[10px] font-mono text-neutral-400 hover:text-[#33AAFF] transition-colors uppercase tracking-wider underline underline-offset-4 decoration-white/10 hover:decoration-[#0099FF]/30"
            >
              {isLogin ? 'No account yet? Sign up' : 'Already a member? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
