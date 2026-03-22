import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Calendar, GraduationCap, ChevronDown, ArrowRight, Phone } from 'lucide-react';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState('');
  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    college: '',
    degree: '',
    graduationYear: '',
  });

  const set = (key) => (e) => setProfile(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    // updateUser sets state AND localStorage → App.jsx sees fullName → auto-redirects to /
    updateUser(profile);
    // navigate as backup
    navigate('/', { replace: true });
  };

  const handleSkip = () => {
    // Set a placeholder so onboarding doesn't repeat
    updateUser({ fullName: user?.name || 'User' });
    navigate('/', { replace: true });
  };

  const inp = "input-dark w-full rounded-xl px-4 py-2.5 text-sm";
  const ico = "absolute left-3.5 top-1/2 -translate-y-1/2";

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.06), transparent)' }} />

      <div className="relative z-10 w-full max-w-lg animate-fsu">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(45,212,191,0.15))', border: '1px solid rgba(167,139,250,0.3)' }}>
            <User size={24} style={{ color: '#A78BFA' }} />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Tell us about yourself
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Personalise your job matching experience
          </p>
          {user?.email && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Logged in as {user.email}
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-8" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Full Name <span style={{ color: '#2DD4BF' }}>*</span>
              </label>
              <div className="relative">
                <User size={14} className={ico} style={{ color: focused === 'name' ? '#2DD4BF' : 'var(--text-muted)' }} />
                <input type="text" value={profile.fullName} onChange={set('fullName')}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                  placeholder="Alex Johnson" required
                  className={`${inp} pl-10`} />
              </div>
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Date of Birth <span style={{ color: '#2DD4BF' }}>*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className={ico} style={{ color: focused === 'dob' ? '#2DD4BF' : 'var(--text-muted)' }} />
                  <input type="date" value={profile.dob} onChange={set('dob')}
                    onFocus={() => setFocused('dob')} onBlur={() => setFocused('')}
                    required max={new Date().toISOString().split('T')[0]}
                    className={`${inp} pl-10`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Gender <span style={{ color: '#2DD4BF' }}>*</span>
                </label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }} />
                  <select value={profile.gender} onChange={set('gender')} required
                    className={`${inp} appearance-none`}
                    style={{
                      color: profile.gender ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: 'rgba(255,255,255,0.04)',
                    }}>
                    <option value="" disabled style={{ background: '#12121C' }}>Select</option>
                    {GENDERS.map(g => (
                      <option key={g} value={g} style={{ background: '#12121C' }}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
              <div className="relative">
                <Phone size={14} className={ico} style={{ color: focused === 'phone' ? '#2DD4BF' : 'var(--text-muted)' }} />
                <input type="tel" value={profile.phone} onChange={set('phone')}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                  placeholder="+91 98765 43210"
                  className={`${inp} pl-10`} />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Education</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* College */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                College / University <span style={{ color: '#2DD4BF' }}>*</span>
              </label>
              <div className="relative">
                <GraduationCap size={14} className={ico} style={{ color: focused === 'college' ? '#2DD4BF' : 'var(--text-muted)' }} />
                <input type="text" value={profile.college} onChange={set('college')}
                  onFocus={() => setFocused('college')} onBlur={() => setFocused('')}
                  placeholder="IIT Delhi / Stanford University" required
                  className={`${inp} pl-10`} />
              </div>
            </div>

            {/* Degree + Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Degree</label>
                <input type="text" value={profile.degree} onChange={set('degree')}
                  placeholder="B.Tech / MBA" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Graduation Year</label>
                <input type="number" value={profile.graduationYear} onChange={set('graduationYear')}
                  placeholder="2025" min="1990" max="2030" className={inp} />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={saving}
              className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                background: saving
                  ? 'rgba(167,139,250,0.15)'
                  : 'linear-gradient(135deg, rgba(167,139,250,0.9), rgba(167,139,250,0.7))',
                color: saving ? 'rgba(167,139,250,0.5)' : '#050508',
                boxShadow: saving ? 'none' : '0 8px 24px rgba(167,139,250,0.25)',
              }}>
              {saving
                ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                : <> Continue to NexusHire <ArrowRight size={15} /> </>}
            </button>

            {/* Skip */}
            <button type="button" onClick={handleSkip}
              className="w-full text-center text-xs py-1.5 transition-colors rounded-lg"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
