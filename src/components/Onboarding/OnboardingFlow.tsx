import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  CheckCircle2,
  HeartPulse,
  Compass,
  Car,
  Lock,
  ArrowRight,
  Database,
  CloudSun,
  Eye,
  EyeOff,
  User,
  Phone,
  Check,
  Sliders,
  LayoutDashboard,
} from 'lucide-react';
import { Language, PersonaId, DashboardConfig } from '../../types';
import { t } from '../../data/translations';
import { PERSONAS, CITIES_DATA } from '../../data/mockData';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateUserProfile,
  DemoUser,
} from '../../services/auth';
import { createDefaultDashboardConfig } from '../../data/dashboardPresets';
import { DashboardCustomizerModal } from '../Modals/DashboardCustomizerModal';

interface OnboardingFlowProps {
  language: Language;
  onFinish: (
    profileData: { name: string; phone: string; cityId: string },
    selectedPersonas: PersonaId[],
    targetTab: 'home' | 'personalized',
    dashboardConfig?: DashboardConfig
  ) => void;
  onLanguageToggle: () => void;
  onLoginReturningUser: (user: DemoUser) => void;
}

export type OnboardingStep =
  | 'welcome'
  | 'auth'
  | 'profile'
  | 'consent'
  | 'personas'
  | 'dashboard-setup';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  language,
  onFinish,
  onLanguageToggle,
  onLoginReturningUser,
}) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  // Profile form states (Step 1 of 3: Profile)
  const [name, setName] = useState('Ankus Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [cityId, setCityId] = useState('delhi');

  // Consent states (Step 2 of 3: Data Consent)
  const [gpsConsent, setGpsConsent] = useState(true);
  const [dpdpConsent, setDpdpConsent] = useState(true);

  // Persona states (Step 3 of 3: Personalization)
  const [selectedPersonas, setSelectedPersonas] = useState<PersonaId[]>([]);
  const hasSelectedPersona = selectedPersonas.length > 0;

  // Dashboard setup choice
  const [dashboardSetupOption, setDashboardSetupOption] = useState<
    'recommended' | 'customize'
  >('recommended');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerConfig, setCustomizerConfig] = useState<DashboardConfig | null>(null);

  const dict = t[language];

  // Helper for persona icons
  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'health':
        return <HeartPulse size={22} color="#0284c7" />;
      case 'traveler':
        return <Compass size={22} color="#7c3aed" />;
      case 'commuter':
        return <Car size={22} color="#d97706" />;
    }
  };

  const togglePersona = (id: PersonaId) => {
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas([]);
    } else {
      setSelectedPersonas([id]);
    }
  };

  // =========================================================================
  // HANDLERS FOR AUTHENTICATION
  // =========================================================================

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setForgotPasswordMsg(false);

    if (!email.trim() || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    try {
      setAuthLoading(true);
      const { user } = await signInWithEmailAndPassword(email, password);
      setAuthLoading(false);

      // RETURNING USER: If already completed profile and onboarding, restore session directly to Home!
      if (user.hasCompletedOnboarding && user.hasCompletedProfile) {
        onLoginReturningUser(user);
        return;
      }

      // Otherwise, advance to Profile Creation
      if (user.name) setName(user.name);
      if (user.cityId) setCityId(user.cityId);
      if (user.phone) setPhone(user.phone);
      setStep('profile');
    } catch (err: unknown) {
      setAuthLoading(false);
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setAuthError(message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setForgotPasswordMsg(false);

    if (!email.trim()) {
      setAuthError('Email address is required.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setAuthError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Password and Confirm Password do not match.');
      return;
    }

    try {
      setAuthLoading(true);
      await createUserWithEmailAndPassword(email, password);
      setAuthLoading(false);
      // New user advances to Profile Creation
      setStep('profile');
    } catch (err: unknown) {
      setAuthLoading(false);
      const message = err instanceof Error ? err.message : 'Account creation failed. Please try again.';
      setAuthError(message);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setAuthError('Please enter your email address to receive password reset instructions.');
      return;
    }
    setAuthError(null);
    setForgotPasswordMsg(true);
  };

  // =========================================================================
  // HANDLERS FOR PROFILE & FINAL SETUP
  // =========================================================================

  const handleProfileContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setName('Citizen User');
    }
    updateUserProfile({ name, phone, cityId, hasCompletedProfile: true });
    setStep('consent');
  };

  const handleConsentContinue = () => {
    setStep('personas');
  };

  const handlePersonasContinue = () => {
    setStep('dashboard-setup');
  };

  const handleSkipPersonas = () => {
    setSelectedPersonas([]);
    setStep('dashboard-setup');
  };

  const handleFinishSetup = () => {
    const effectivePersona = selectedPersonas[0] || 'health';

    if (dashboardSetupOption === 'recommended') {
      const config = createDefaultDashboardConfig(effectivePersona, 'recommended');
      updateUserProfile({ hasCompletedOnboarding: true });
      onFinish({ name, phone, cityId }, selectedPersonas, 'home', config);
    } else {
      // Option 2: Pre-populate with recommended and open customizer
      const config = createDefaultDashboardConfig(effectivePersona, 'customize');
      setCustomizerConfig(config);
      setIsCustomizerOpen(true);
    }
  };

  const handleSkipDashboardSetup = () => {
    // If persona was selected, use recommended dashboard for that persona.
    // If persona was skipped, use default recommended dashboard (health fallback).
    const effectivePersona = selectedPersonas[0] || 'health';
    const config = createDefaultDashboardConfig(effectivePersona, 'recommended');
    updateUserProfile({ hasCompletedOnboarding: true });
    onFinish({ name, phone, cityId }, selectedPersonas, 'home', config);
  };

  const handleSaveCustomizer = (savedConfig: DashboardConfig) => {
    setIsCustomizerOpen(false);
    updateUserProfile({ hasCompletedOnboarding: true });
    onFinish({ name, phone, cityId }, selectedPersonas, 'home', savedConfig);
  };

  // =========================================================================
  // SCREEN 1: WELCOME / LANDING
  // =========================================================================
  if (step === 'welcome') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          padding: '24px 20px',
          background: 'linear-gradient(180deg, #002b5c 0%, #083b77 60%, #0b1e36 100%)',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div style={{ alignSelf: 'flex-end' }}>
          <button
            onClick={onLanguageToggle}
            style={{
              color: '#ffffff',
              background: 'rgba(255,255,255,0.15)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            {language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
          {/* IMD Emblem Logo */}
          <div
            style={{
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '3px solid #c29b38',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#002b5c',
              padding: '6px',
            }}
          >
            <CloudSun size={36} color="#002b5c" strokeWidth={2.2} />
            <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1px', marginTop: '2px' }}>
              IMD
            </span>
          </div>

          <div>
            <p style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#c29b38', fontWeight: 700 }}>
              {dict.govHeader}
            </p>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.3px' }}>
              Mausam
            </h1>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#93c5fd', marginTop: '4px' }}>
              Personalized weather for everyday decisions.
            </h2>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '14px',
              marginTop: '6px',
              maxWidth: '320px',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: '#e2e8f0',
            }}
          >
            Official IMD forecasts tuned to your daily routine, commute routes, health sensitivities, and travel plans.
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              setAuthMode('signup');
              setStep('auth');
            }}
            style={{ background: '#ff9933', color: '#000', fontWeight: 800, fontSize: '0.92rem', minHeight: '44px' }}
          >
            <span>Get Started &bull; Sign Up</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => {
              setAuthMode('login');
              setStep('auth');
            }}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              minHeight: '42px',
              cursor: 'pointer',
            }}
          >
            Already have an account? Sign In
          </button>

          <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Built for Smart India Hackathon &bull; Ministry of Earth Sciences Prototype
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: AUTH SCREEN (LOGIN / SIGN UP WITH EMAIL + PASSWORD)
  // =========================================================================
  if (step === 'auth') {
    return (
      <div
        style={{
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <button
            onClick={() => setStep('welcome')}
            style={{ color: 'var(--imd-secondary)', fontSize: '0.8rem', fontWeight: 700 }}
          >
            &larr; Back
          </button>
          <button
            onClick={onLanguageToggle}
            style={{
              color: 'var(--imd-primary)',
              background: '#f1f5f9',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>

        {/* Brand Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--imd-primary)', letterSpacing: '-0.3px' }}>
            Mausam
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
            Personalized weather for everyday decisions.
          </p>
        </div>

        {/* Segmented Switcher: [ Login ] [ Sign Up ] */}
        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setAuthError(null);
              setForgotPasswordMsg(false);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: authMode === 'login' ? 800 : 600,
              background: authMode === 'login' ? '#ffffff' : 'transparent',
              color: authMode === 'login' ? 'var(--imd-primary)' : 'var(--text-muted)',
              boxShadow: authMode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setAuthError(null);
              setForgotPasswordMsg(false);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: authMode === 'signup' ? 800 : 600,
              background: authMode === 'signup' ? '#ffffff' : 'transparent',
              color: authMode === 'signup' ? 'var(--imd-primary)' : 'var(--text-muted)',
              boxShadow: authMode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Validation / Error Banner */}
        {authError && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.78rem',
              marginBottom: '12px',
              lineHeight: 1.4,
              fontWeight: 600,
            }}
          >
            {authError}
          </div>
        )}

        {/* Forgot Password Feedback */}
        {forgotPasswordMsg && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#166534',
              fontSize: '0.78rem',
              marginBottom: '12px',
              lineHeight: 1.4,
              fontWeight: 600,
            }}
          >
            Password reset link dispatched to {email || 'your email'}. Check your inbox.
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--imd-secondary)',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary"
              style={{ marginTop: '8px', minHeight: '44px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              <span>{authLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                style={{
                  color: 'var(--imd-secondary)',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* ================= SIGN UP FORM ================= */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="•••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-light)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary"
              style={{ marginTop: '8px', minHeight: '44px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              <span>{authLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                style={{
                  color: 'var(--imd-secondary)',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3: CREATE YOUR PROFILE (STEP 1 OF 3: PROFILE)
  // =========================================================================
  if (step === 'profile') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-app)',
        }}
      >
        <form
          onSubmit={handleProfileContinue}
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Scrollable Content */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px 16px 12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--imd-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                STEP 1 OF 3: PROFILE
              </span>
              <h2
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--imd-primary)',
                  marginTop: '2px',
                  lineHeight: 1.25,
                }}
              >
                Create Your Profile
              </h2>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '3px',
                  lineHeight: 1.35,
                }}
              >
                Set up your Mausam profile for personalized weather information.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <User size={15} color="var(--imd-secondary)" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Phone size={15} color="var(--imd-secondary)" />
                <span>Mobile Number</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
                  (Optional)
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin size={15} color="var(--imd-secondary)" />
                <span>Primary Location</span>
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '0.88rem',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                {CITIES_DATA.map((city) => (
                  <option key={city.id} value={city.id}>
                    {language === 'en'
                      ? `${city.name} (${city.state})`
                      : `${city.nameHi} (${city.stateHi})`}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.73rem',
                color: 'var(--text-muted)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginTop: '2px',
              }}
            >
              <Database size={16} color="var(--imd-secondary)" style={{ flexShrink: 0 }} />
              <span>Profile details are used for local personalization and are stored on-device.</span>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div
            style={{
              flexShrink: 0,
              padding: '10px 16px 12px 16px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <button
              type="submit"
              className="btn-primary"
              style={{ minHeight: '40px', fontSize: '0.86rem', fontWeight: 800, width: '100%' }}
            >
              <span>Continue to Data Consent</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 4: DATA CONSENT (STEP 2 OF 3: DATA CONSENT)
  // =========================================================================
  if (step === 'consent') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-app)',
        }}
      >
        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '16px 16px 12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--imd-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              STEP 2 OF 3: DATA CONSENT
            </span>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--imd-primary)',
                marginTop: '2px',
                lineHeight: 1.25,
              }}
            >
              Your data and privacy
            </h2>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: '3px',
                lineHeight: 1.35,
              }}
            >
              Transparent disclosure on how your information powers your weather experience.
            </p>
          </div>

          {/* Brief explanation of data usage */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--imd-primary)' }}>
              What your information is used for:
            </span>
            <ul
              style={{
                paddingLeft: '16px',
                fontSize: '0.73rem',
                color: 'var(--text-main)',
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              <li>
                <strong>Weather Personalization:</strong> Tailoring advisory and activity indices.
              </li>
              <li>
                <strong>Location-Based Weather:</strong> Delivering localized Doppler radar forecasts.
              </li>
              <li>
                <strong>Alerts & Severe Weather:</strong> Prioritizing life-critical warnings.
              </li>
              <li>
                <strong>Preferences & Plans:</strong> Saving itineraries strictly on your device.
              </li>
            </ul>
          </div>

          {/* DPDP Box */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                color: '#166534',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>DPDP Act, 2023 Compliance</span>
            </div>
            <p
              style={{
                fontSize: '0.72rem',
                color: '#14532d',
                marginTop: '4px',
                lineHeight: 1.4,
              }}
            >
              Your location history, plans, and comfort metrics are computed and stored strictly
              ON-DEVICE. No personal activity profiles are transmitted to central servers.
            </p>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.77rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={gpsConsent}
                onChange={(e) => setGpsConsent(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '1px',
                  accentColor: 'var(--imd-primary)',
                  flexShrink: 0,
                }}
              />
              <span style={{ lineHeight: 1.35 }}>
                I consent to location access for localized warnings and route forecasts.
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.77rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={dpdpConsent}
                onChange={(e) => setDpdpConsent(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '1px',
                  accentColor: 'var(--imd-primary)',
                  flexShrink: 0,
                }}
              />
              <span style={{ lineHeight: 1.35 }}>
                I acknowledge the data privacy terms and consent to on-device personalization.
              </span>
            </label>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div
          style={{
            flexShrink: 0,
            padding: '10px 16px 12px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '10px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <button
            className="btn-secondary"
            onClick={() => setStep('profile')}
            style={{ width: '32%', minHeight: '40px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            Back
          </button>
          <button
            className="btn-primary"
            disabled={!gpsConsent || !dpdpConsent}
            onClick={handleConsentContinue}
            style={{
              width: '68%',
              minHeight: '40px',
              fontSize: '0.84rem',
              opacity: !gpsConsent || !dpdpConsent ? 0.6 : 1,
              fontWeight: 800,
            }}
          >
            <span>Accept & Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // =========================================================================
  // SCREEN 5: PERSONA SELECTION (STEP 3 OF 3: PERSONALIZATION)
  // =========================================================================
  if (step === 'personas') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-app)' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 16px 10px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--imd-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                STEP 3 OF 3: PERSONALIZATION
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--imd-primary)', marginTop: '2px', lineHeight: 1.25 }}>
                Choose your primary use case.
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.35 }}>
                {!hasSelectedPersona
                  ? 'Preview how Mausam personalizes your dashboard.'
                  : 'Who are you planning weather around? Select one or more:'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkipPersonas}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--imd-secondary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            >
              Skip
            </button>
          </div>

          {/* EXACTLY 3 PERSONAS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PERSONAS.map((persona) => {
              const isSelected = selectedPersonas.includes(persona.id);
              return (
                <div
                  key={persona.id}
                  onClick={() => togglePersona(persona.id)}
                  style={{
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(2,132,199,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, paddingRight: '8px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: `${persona.accentColor}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getPersonaIcon(persona.id)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                        {language === 'en' ? persona.nameEn : persona.nameHi}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                        {language === 'en' ? persona.taglineEn : persona.taglineHi}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <CheckCircle2 size={20} color="#0284c7" />
                    ) : (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DEMO PERSONA PREVIEW: Visible when no persona is selected yet */}
          {!hasSelectedPersona && (
            <div
              style={{
                marginTop: '10px',
                background: '#ffffff',
                border: '1.5px dashed #0284c7',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: '#0284c7',
                      color: '#ffffff',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    DEMO PREVIEW
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--imd-primary)' }}>
                    Health-Conscious
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Previewing as default
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '6px',
                }}
              >
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 600 }}>AQI</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a' }}>142 • Moderate</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 600 }}>UV Index</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d97706' }}>6.4 • Very High</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 600 }}>Allergy / Asthma Risk</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ea580c' }}>High (Grass Pollen)</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 600 }}>Best Outdoor Hours</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7' }}>05:30 AM – 07:30 AM</div>
                </div>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                Demo preview — choose a persona to personalize your dashboard.
              </div>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, padding: '10px 16px 12px 16px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setStep('consent')} style={{ width: '32%', minHeight: '40px', fontSize: '0.82rem', fontWeight: 700 }}>
            Back
          </button>
          <button
            className="btn-primary"
            onClick={handlePersonasContinue}
            disabled={!hasSelectedPersona}
            style={{
              width: '68%',
              minHeight: '40px',
              fontWeight: 800,
              fontSize: '0.84rem',
              opacity: !hasSelectedPersona ? 0.6 : 1,
              cursor: !hasSelectedPersona ? 'not-allowed' : 'pointer',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 6: DASHBOARD SETUP
  // =========================================================================
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-app)',
        position: 'relative',
      }}
    >
      {/* Scrollable Content Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 16px 10px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          <div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--imd-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              DASHBOARD SETUP
            </span>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--imd-primary)',
                marginTop: '2px',
                lineHeight: 1.25,
              }}
            >
              How would you like to set up your Mausam dashboard?
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSkipDashboardSetup}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--imd-secondary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '4px',
              flexShrink: 0,
            }}
          >
            Skip
          </button>
        </div>

        {/* Selected or Default Persona Context Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '6px',
            background: hasSelectedPersona ? '#f0f9ff' : '#f8fafc',
            border: hasSelectedPersona ? '1px solid #bae6fd' : '1px solid #e2e8f0',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: hasSelectedPersona ? '#0284c7' : 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {hasSelectedPersona ? 'Selected Persona:' : 'Default Profile:'}
          </span>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            {hasSelectedPersona
              ? selectedPersonas
                  .map((id) => {
                    const p = PERSONAS.find((item) => item.id === id);
                    return p ? (language === 'en' ? p.nameEn : p.nameHi) : id;
                  })
                  .join(', ')
              : 'Health-Conscious (Using default recommendations)'}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            lineHeight: 1.35,
          }}
        >
          Choose your starting layout. You can customize anytime.
        </p>

        {/* 3 Selectable Option Cards (Compact & Responsive) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Option 1: Use Recommended Dashboard */}
          <div
            onClick={() => setDashboardSetupOption('recommended')}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: dashboardSetupOption === 'recommended' ? '#f0f9ff' : '#ffffff',
              border:
                dashboardSetupOption === 'recommended'
                  ? '2px solid #0284c7'
                  : '1px solid var(--border-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.15s ease',
              boxShadow:
                dashboardSetupOption === 'recommended'
                  ? '0 2px 6px rgba(2,132,199,0.1)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LayoutDashboard size={18} color="#0284c7" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  lineHeight: 1.2,
                }}
              >
                1. Use Recommended Dashboard
              </div>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                  lineHeight: 1.35,
                }}
              >
                Start with information recommended for your profile.
              </p>
            </div>
            {dashboardSetupOption === 'recommended' ? (
              <Check size={18} color="#0284c7" style={{ flexShrink: 0 }} />
            ) : (
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1.5px solid #cbd5e1',
                  flexShrink: 0,
                }}
              />
            )}
          </div>

          {/* Option 2: Customize Recommended Dashboard */}
          <div
            onClick={() => setDashboardSetupOption('customize')}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: dashboardSetupOption === 'customize' ? '#f0f9ff' : '#ffffff',
              border:
                dashboardSetupOption === 'customize'
                  ? '2px solid #0284c7'
                  : '1px solid var(--border-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.15s ease',
              boxShadow:
                dashboardSetupOption === 'customize'
                  ? '0 2px 6px rgba(2,132,199,0.1)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sliders size={18} color="#d97706" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  lineHeight: 1.2,
                }}
              >
                2. Customize Recommended Dashboard
              </div>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                  lineHeight: 1.35,
                }}
              >
                Choose and arrange the information you want to see.
              </p>
            </div>
            {dashboardSetupOption === 'customize' ? (
              <Check size={18} color="#0284c7" style={{ flexShrink: 0 }} />
            ) : (
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1.5px solid #cbd5e1',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Fixed/Sticky Bottom Action Bar */}
      <div
        style={{
          flexShrink: 0,
          padding: '10px 16px 12px 16px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '10px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <button
          className="btn-secondary"
          onClick={() => setStep('personas')}
          style={{ width: '32%', minHeight: '40px', fontSize: '0.82rem', fontWeight: 700 }}
        >
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleFinishSetup}
          style={{
            width: '68%',
            minHeight: '40px',
            fontSize: '0.84rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          <span>
            {dashboardSetupOption === 'recommended'
              ? 'Use Recommended'
              : 'Customize Dashboard'}
          </span>
          <ArrowRight size={16} />
        </button>
      </div>

      {isCustomizerOpen && customizerConfig && (
        <DashboardCustomizerModal
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          personaId={selectedPersonas[0] || 'health'}
          currentConfig={customizerConfig}
          onSave={handleSaveCustomizer}
          language={language}
          isFirstTimeSetup={true}
        />
      )}
    </div>
  );
};
