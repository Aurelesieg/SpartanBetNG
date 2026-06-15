import React, { useState } from 'react';
import { useAuth } from '../../store/contexts/AuthContext';
import { ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
        setError('Les mots de passe ne correspondent pas.');
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError('Le nom est requis.');
        setLoading(false);
        return;
      }
      const res = await signUp(email, password, name);
      if (res.error) {
        setError(res.error);
      } else {
        // Force switch to login or show success message depending on Supabase email confirmation settings
        setError('Inscription réussie. Vous pouvez maintenant vous connecter (ou vérifiez votre email).');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-4 selection:bg-orange-500/30">

      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
            <span className="text-3xl font-black text-orange-500 font-mono tracking-tighter">S</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">
            Spartan <span className="text-orange-500">Bet</span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">La discipline et les statistiques font la différence.</p>
        </div>

        <div className="bg-[#131115] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Nom de Spartan</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono outline-none"
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
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono outline-none"
                placeholder="spartan@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono outline-none"
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
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-white focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono outline-none"
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
              className="w-full py-3 mt-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-wait text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">{isLogin ? 'Connexion...' : 'Création...'}</span>
              ) : (
                <>
                  {isLogin ? 'Accéder au QG' : 'Rejoindre les rangs'}
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
              className="text-[10px] font-mono text-neutral-400 hover:text-orange-400 transition-colors uppercase tracking-wider underline underline-offset-4 decoration-white/10 hover:decoration-orange-500/30"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà membre ? Se connecter"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
