import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  GraduationCap,
  Languages,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Brand from '../components/Brand';
import { api } from '../lib/api';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LANGUAGES = ['English', 'Hindi'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  level: '',
  language: '',
  agree: false,
};

function validateField(name, value, form) {
  switch (name) {
    case 'fullName':
      if (!value.trim()) return 'Enter your full name.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    case 'email':
      if (!value.trim()) return 'Enter your email address.';
      if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address.';
      return '';
    case 'password':
      if (!value) return 'Create a password.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter.';
      if (!/[0-9]/.test(value)) return 'Include at least one number.';
      return '';
    case 'confirmPassword':
      if (!value) return 'Confirm your password.';
      if (value !== form.password) return 'Passwords do not match.';
      return '';
    case 'level':
      if (!value) return 'Select your learning level.';
      return '';
    case 'language':
      if (!value) return 'Select your preferred language.';
      return '';
    case 'agree':
      if (!value) return 'You must accept the terms to continue.';
      return '';
    default:
      return '';
  }
}

function validateAll(form) {
  const errors = {};
  Object.keys(initialForm).forEach((key) => {
    const message = validateField(key, form[key], form);
    if (message) errors[key] = message;
  });
  return errors;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-rose-400">
      <AlertCircle size={13} className="shrink-0" />
      {message}
    </p>
  );
}

const inputBase =
  'w-full rounded-2xl bg-white/[0.04] border text-white placeholder-white/35 text-[14.5px] outline-none transition-colors px-4 py-3.5 focus:bg-white/[0.06]';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const setField = (name, value) => {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, nextForm) }));
    }
    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', nextForm.confirmPassword, nextForm),
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name], form) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched(
      Object.keys(initialForm).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (Object.keys(allErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Persists the account in the backend's SQLite database (see
      // POST /api/register) — the password is hashed server-side and the
      // row survives refreshes, restarts, and redeploys. Nothing about the
      // registration is kept in localStorage/sessionStorage.
      const user = await api.register({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        level: form.level,
        language: form.language,
      });
      setSuccess(true);
      setTimeout(() => navigate('/classroom', { state: { studentId: user.user.id, name: user.user.full_name } }), 1100);
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'One number', ok: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="relative min-h-screen bg-ink-950 overflow-hidden">
      {/* Background glow, consistent with the landing hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(55% 45% at 20% 10%, rgba(124,77,255,0.18), transparent 60%), radial-gradient(50% 40% at 85% 90%, rgba(88,101,242,0.14), transparent 60%)',
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-[0.10] mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-8">
        {/* Top bar */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[13px] text-white/40">Step 1 of 1</span>
        </div>

        {/* Brand */}
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Brand size={52} />
          </motion.div>
          <h1 className="font-display text-[22px] font-bold text-white mt-6">
            Create your account
          </h1>
          <p className="text-[14px] text-white/45 mt-1.5 max-w-[300px]">
            Set up your profile so your AI teacher can tailor every lesson to you.
          </p>
        </div>

        {/* Form card */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto bg-ink-800/70 border border-hair rounded-3xl shadow-panel p-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-[18px] font-bold text-white">
              Account created
            </h2>
            <p className="text-[13.5px] text-white/50 mt-1.5">
              Taking you to your classroom…
            </p>
          </motion.div>
        ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md mx-auto bg-ink-800/70 border border-hair rounded-3xl shadow-panel p-6 sm:p-7"
        >
          {submitError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-300">
              <AlertCircle size={15} className="shrink-0" />
              {submitError}
            </div>
          )}

          {/* Full name */}
          <label className="block mb-4">
            <span className="block text-[12.5px] font-medium text-white/55 mb-1.5">
              Full name
            </span>
            <div className="relative">
              <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                autoComplete="name"
                placeholder="Aditi Sharma"
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                aria-invalid={!!errors.fullName}
                className={`${inputBase} pl-11 ${
                  errors.fullName ? 'border-rose-500/60' : 'border-white/[0.08] focus:border-violet-light/70'
                }`}
              />
            </div>
            <FieldError message={errors.fullName} />
          </label>

          {/* Email */}
          <label className="block mb-4">
            <span className="block text-[12.5px] font-medium text-white/55 mb-1.5">
              Email address
            </span>
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={!!errors.email}
                className={`${inputBase} pl-11 ${
                  errors.email ? 'border-rose-500/60' : 'border-white/[0.08] focus:border-violet-light/70'
                }`}
              />
            </div>
            <FieldError message={errors.email} />
          </label>

          {/* Password */}
          <label className="block mb-1.5">
            <span className="block text-[12.5px] font-medium text-white/55 mb-1.5">
              Password
            </span>
            <div className="relative">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                aria-invalid={!!errors.password}
                className={`${inputBase} pl-11 pr-11 ${
                  errors.password ? 'border-rose-500/60' : 'border-white/[0.08] focus:border-violet-light/70'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <FieldError message={errors.password} />
          </label>

          {(touched.password || form.password) && (
            <ul className="mb-4 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {passwordChecks.map((check) => (
                <li
                  key={check.label}
                  className={`flex items-center gap-1.5 text-[11.5px] ${
                    check.ok ? 'text-emerald-400' : 'text-white/35'
                  }`}
                >
                  <CheckCircle2 size={12} />
                  {check.label}
                </li>
              ))}
            </ul>
          )}

          {/* Confirm password */}
          <label className="block mb-5">
            <span className="block text-[12.5px] font-medium text-white/55 mb-1.5">
              Confirm password
            </span>
            <div className="relative">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                className={`${inputBase} pl-11 pr-11 ${
                  errors.confirmPassword
                    ? 'border-rose-500/60'
                    : 'border-white/[0.08] focus:border-violet-light/70'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword} />
          </label>

          {/* Learning level + language, mirrors StudentRequest on the backend */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <label className="block">
              <span className="block text-[12.5px] font-medium text-white/55 mb-1.5">
                Learning level
              </span>
              <div className="relative">
                <GraduationCap size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <select
                  value={form.level}
                  onChange={(e) => setField('level', e.target.value)}
                  onBlur={() => handleBlur('level')}
                  aria-invalid={!!errors.level}
                  className={`${inputBase} pl-10 pr-3 appearance-none ${
                    errors.level ? 'border-rose-500/60' : 'border-white/[0.08] focus:border-violet-light/70'
                  } ${!form.level ? 'text-white/35' : ''}`}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl} className="text-ink-900">
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <FieldError message={errors.level} />
            </label>

            <label className="block">
              <span className="block text-[12.5px] font-medium text-white/55 mb-1.5">
                Preferred language
              </span>
              <div className="relative">
                <Languages size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <select
                  value={form.language}
                  onChange={(e) => setField('language', e.target.value)}
                  onBlur={() => handleBlur('language')}
                  aria-invalid={!!errors.language}
                  className={`${inputBase} pl-10 pr-3 appearance-none ${
                    errors.language ? 'border-rose-500/60' : 'border-white/[0.08] focus:border-violet-light/70'
                  } ${!form.language ? 'text-white/35' : ''}`}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="text-ink-900">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <FieldError message={errors.language} />
            </label>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => setField('agree', e.target.checked)}
              onBlur={() => handleBlur('agree')}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-violet-light shrink-0"
            />
            <span className="text-[12.5px] leading-relaxed text-white/50">
              I agree to the{' '}
              <span className="text-violet-light hover:text-white transition-colors">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-violet-light hover:text-white transition-colors">
                Privacy Policy
              </span>
              .
            </span>
          </label>
          <FieldError message={errors.agree} />

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.01 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-violet hover:bg-violet-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-3.5 shadow-lift transition-colors mt-1"
          >
            {submitting && <Loader2 size={17} className="animate-spin" />}
            {submitting ? 'Creating account…' : 'Create account'}
          </motion.button>
        </form>
        )}

        {/* Footer / secondary action */}
        {!success && (
          <div className="w-full max-w-md mx-auto mt-6">
            <Link
              to="/"
              className="w-full flex items-center justify-center rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/30 font-semibold text-[14.5px] py-3.5 transition-colors"
            >
              Already have an account? Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
