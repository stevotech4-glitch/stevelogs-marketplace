import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Terminal,
  CheckCircle2,
  Delete
} from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: (token: string) => void;
  onBackToWebsite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onBackToWebsite,
}) => {
  const [authMode, setAuthMode] = useState<'passcode' | 'credentials'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount or mode change
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [authMode]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        setLockedUntil(null);
        setError(false);
        setErrorMessage('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleLogin = async (codeToSubmit?: string) => {
    if (lockedUntil && remainingSeconds > 0) return;

    const rawCode = (codeToSubmit !== undefined ? codeToSubmit : passcode).trim();
    const payload = authMode === 'passcode'
      ? { passcode: rawCode }
      : { username: username.trim(), password: password.trim() };

    if (authMode === 'passcode' && (!rawCode || rawCode.length < 4)) {
      setError(true);
      setErrorMessage('Please enter an authorized administrative passcode (min. 4 digits).');
      return;
    }

    if (authMode === 'credentials' && (!username.trim() || !password)) {
      setError(true);
      setErrorMessage('Please enter both administrative username and password/passcode.');
      return;
    }

    setLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn('[AdminLogin] JSON parse notice:', jsonErr);
        }
      }

      if (res.ok && data?.token) {
        sessionStorage.setItem('stevelogs_admin_token', data.token);
        sessionStorage.setItem('stevelogs_admin_unlocked', 'true');
        setError(false);
        setErrorMessage('');
        onSuccess(data.token);
      } else if (res.status === 429) {
        setError(true);
        const lockTime = data?.lockedUntil || (Date.now() + 5 * 60 * 1000);
        setLockedUntil(lockTime);
        setRemainingSeconds(data?.remainingSeconds || 300);
        setErrorMessage(data?.error || 'Security Lockout: Too many failed administrative attempts.');
      } else if (data?.error) {
        setError(true);
        setErrorMessage(data.error);
        if (authMode === 'passcode') {
          setPasscode('');
          inputRef.current?.focus();
        }
      } else {
        setError(true);
        setErrorMessage(`Authentication error (HTTP ${res.status}: ${res.statusText || 'Access Denied'}). Please verify credentials.`);
        if (authMode === 'passcode') {
          setPasscode('');
          inputRef.current?.focus();
        }
      }
    } catch (fetchErr: any) {
      console.error('[AdminLogin] Connection error:', fetchErr);
      setError(true);
      setErrorMessage(
        fetchErr?.message
          ? `Connection failed (${fetchErr.message}). Check your network connection and retry.`
          : 'Unable to reach the administrator authentication service. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDigitClick = (digit: string) => {
    if (loading || (lockedUntil && remainingSeconds > 0)) return;
    if (passcode.length < 12) {
      const nextCode = passcode + digit;
      setPasscode(nextCode);
      setError(false);
      setErrorMessage('');
      // Quick auto-submit if exactly 6 digits are typed and user paused, or user can click Enter/Submit
      if (nextCode.length === 6) {
        handleLogin(nextCode);
      }
    }
  };

  const handleDeleteDigit = () => {
    if (loading) return;
    setPasscode((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClearAll = () => {
    if (loading) return;
    setPasscode('');
    setError(false);
    setErrorMessage('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-blue-600/30 font-sans">
      {/* Top Security Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
              STEVELOGS TERMINAL
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                RESTRICTED
              </span>
            </h1>
            <p className="text-[11px] font-mono text-slate-400">Secure Internal Management Portal</p>
          </div>
        </div>

        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Customer Site</span>
        </button>
      </header>

      {/* Main Restricted Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle security ambient glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top lock icon */}
          <div className="text-center space-y-3 mb-6 relative">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Lock className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                Administrator Authentication
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Authorized access only. All authentication attempts and network addresses are logged.
              </p>
            </div>

            {/* Mode switch pills */}
            <div className="flex items-center justify-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 max-w-[240px] mx-auto mt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('passcode');
                  setError(false);
                  setErrorMessage('');
                }}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === 'passcode'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Passcode PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('credentials');
                  setError(false);
                  setErrorMessage('');
                }}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === 'credentials'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                User & Password
              </button>
            </div>
          </div>

          {/* Rate Limit Lockout Banner */}
          {lockedUntil && remainingSeconds > 0 && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">Security Rate-Limit Active</p>
                <p className="mt-0.5 text-rose-300/90 leading-relaxed">
                  Too many failed attempts. Terminal locked for security. Try again in{' '}
                  <span className="font-mono font-bold text-white bg-rose-950/60 px-1.5 py-0.5 rounded">
                    {remainingSeconds}s
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (!lockedUntil || remainingSeconds <= 0) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form: Passcode Mode */}
          {authMode === 'passcode' ? (
            <div className="space-y-5">
              {/* Visible Interactive PIN Display & Input Container */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  maxLength={16}
                  value={passcode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPasscode(val);
                    setError(false);
                    setErrorMessage('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLogin();
                    }
                  }}
                  disabled={Boolean(lockedUntil && remainingSeconds > 0) || loading}
                  placeholder="Enter Passcode PIN"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Visual PIN Dots Indicator (shows current entry length) */}
              <div 
                onClick={() => inputRef.current?.focus()}
                className="flex justify-center items-center gap-2.5 py-1 cursor-pointer select-none"
              >
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = idx < passcode.length;
                  return (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        isFilled
                          ? 'bg-blue-500 scale-125 shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  );
                })}
                {passcode.length > 6 && (
                  <span className="text-[10px] font-mono font-bold text-blue-400 ml-1">
                    +{passcode.length - 6}
                  </span>
                )}
              </div>

              {/* Numeric Keypad for Touch / Quick PIN Entry */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    disabled={loading || Boolean(lockedUntil && remainingSeconds > 0)}
                    onClick={() => handleDigitClick(digit)}
                    className="h-11 sm:h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600/30 border border-slate-700/60 font-mono text-lg font-bold text-slate-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={loading || passcode.length === 0 || Boolean(lockedUntil && remainingSeconds > 0)}
                  onClick={handleDeleteDigit}
                  className="h-11 sm:h-12 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700/50 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Backspace"
                >
                  <Delete className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={loading || Boolean(lockedUntil && remainingSeconds > 0)}
                  onClick={() => handleDigitClick('0')}
                  className="h-11 sm:h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600/30 border border-slate-700/60 font-mono text-lg font-bold text-slate-100 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  0
                </button>
                <button
                  type="button"
                  disabled={loading || passcode.length < 4 || Boolean(lockedUntil && remainingSeconds > 0)}
                  onClick={() => handleLogin()}
                  className="h-11 sm:h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border border-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-600/25"
                  title="Unlock Admin Panel"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Go</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Actions: Clear & Full Unlock Button */}
              <div className="flex items-center justify-between text-xs px-2 pt-1">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={loading || passcode.length === 0}
                  className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  Clear PIN
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin()}
                  disabled={loading || passcode.length < 4 || Boolean(lockedUntil && remainingSeconds > 0)}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  {loading ? 'Verifying...' : 'Unlock Dashboard →'}
                </button>
              </div>
            </div>
          ) : (
            /* Credentials Mode */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                  Admin Identifier
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={loading || Boolean(lockedUntil && remainingSeconds > 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                  Admin Password / Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin credentials"
                    disabled={loading || Boolean(lockedUntil && remainingSeconds > 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password || Boolean(lockedUntil && remainingSeconds > 0)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Management Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Notice Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-medium">PBKDF2 Salted Cryptographic Verification</span>
            </div>
            <p className="text-slate-400">
              All administrative operations are cryptographically signed & tracked in system audit logs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-slate-800/60 text-center text-xs text-slate-400 font-mono">
        STEVELOGS MARKETPLACE // RESTRICTED ACCESS SYSTEM // ROUTE: /secure-admin
      </footer>
    </div>
  );
};
