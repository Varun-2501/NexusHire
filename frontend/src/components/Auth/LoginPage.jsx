import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('test@123');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // login() sets user in context → App.jsx ProtectedRoute redirects to /onboarding
    await login(email, password);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2DD4BF, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />

      {[...Array(10)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: (Math.random() * 3 + 1) + 'px',
            height: (Math.random() * 3 + 1) + 'px',
            background: i % 2 === 0 ? '#2DD4BF' : '#A78BFA',
            left: (Math.random() * 100) + '%',
            top: (Math.random() * 100) + '%',
            opacity: Math.random() * 0.4 + 0.1,
            animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: (Math.random() * 4) + 's',
          }} />
      ))}

      <div className="relative z-10 w-full max-w-md animate-fsu">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(45,212,191,0.3)' }}>
            <Zap size={28} className="text-teal-400" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="gradient-text">NexusHire</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI-powered job tracking & smart matching
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <h2 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue your job search
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: focused === 'email' ? '#2DD4BF' : 'var(--text-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  className="input-dark w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  placeholder="you@example.com" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: focused === 'pass' ? '#2DD4BF' : 'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                  className="input-dark w-full rounded-xl pl-10 pr-10 py-3 text-sm"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="rounded-xl px-4 py-3 text-xs"
              style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', color: 'var(--text-secondary)' }}>
              <span style={{ color: '#2DD4BF' }}>Test credentials</span> — Email: test@gmail.com · Password: test@123
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? 'rgba(45,212,191,0.1)' : 'linear-gradient(135deg, rgba(45,212,191,0.9), rgba(45,212,191,0.7))',
                color: loading ? 'rgba(45,212,191,0.5)' : '#050508',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(45,212,191,0.25)',
              }}>
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                : <> Sign in <ArrowRight size={15} /> </>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          AI-powered matching · LangChain · LangGraph
        </p>
      </div>
    </div>
  );
}
