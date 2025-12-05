import React, { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface LoginFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  isSignUp,
  isLoading,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  onSubmit,
  onToggleMode,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic theme colors based on mode
  const theme = isSignUp ? {
    primary: 'emerald',
    bgColor: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    ringColor: 'focus:ring-emerald-500/20',
    borderColor: 'focus:border-emerald-500',
    textColor: 'text-emerald-600',
    textHover: 'hover:text-emerald-700',
    shadowColor: 'shadow-emerald-600/20',
    gradient: 'bg-emerald-600',
    ringFocus: 'focus:ring-4 focus:ring-emerald-500/20',
    checkboxBg: 'bg-emerald-600 border-emerald-700'
  } : {
    primary: 'blue',
    bgColor: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    ringColor: 'focus:ring-blue-500/20',
    borderColor: 'focus:border-blue-500',
    textColor: 'text-blue-600',
    textHover: 'hover:text-blue-700',
    shadowColor: 'shadow-blue-600/20',
    gradient: 'bg-blue-600',
    ringFocus: 'focus:ring-4 focus:ring-blue-500/20',
    checkboxBg: 'bg-blue-600 border-blue-700'
  };

  return (
    <div className={`w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border transition-all duration-500 overflow-hidden ${
      isSignUp 
        ? 'border-emerald-200 dark:border-emerald-900/50' 
        : 'border-zinc-200 dark:border-zinc-800'
    }`}>
      {/* Animated background accent */}
      <div className={`h-1.5 w-full transition-all duration-500 ${
        isSignUp 
          ? 'bg-emerald-500' 
          : 'bg-blue-500'
      }`} />
      
      <div className="p-8 relative">
        {/* Decorative background element */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 transition-all duration-500 ${
          isSignUp ? 'bg-emerald-500' : 'bg-blue-500'
        }`} style={{ transform: 'translate(40%, -40%)' }} />
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className={`p-3 rounded-xl text-white mb-4 shadow-lg transition-all duration-500 ${
            isSignUp 
              ? 'bg-emerald-600 shadow-emerald-600/20' 
              : 'bg-blue-600 shadow-blue-600/20'
          }`}>
            {isSignUp ? (
              <UserPlus size={32} strokeWidth={1.5} />
            ) : (
              <LogIn size={32} strokeWidth={1.5} />
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            {isSignUp && (
              <Sparkles className="text-emerald-500 animate-pulse" size={20} />
            )}
          </div>
          
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            {isSignUp 
              ? 'Join us today and start your freelancing journey!' 
              : 'Sign in to access your projects and contests'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isSignUp ? 'text-emerald-400' : 'text-zinc-400'
              }`} size={18} />
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none focus:ring-2 ${theme.ringColor} ${theme.borderColor} transition-all`}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isSignUp ? 'text-emerald-400' : 'text-zinc-400'
              }`} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none focus:ring-2 ${theme.ringColor} ${theme.borderColor} transition-all font-sans`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-colors ${rememberMe 
                    ? theme.checkboxBg 
                    : 'border-zinc-300 dark:border-zinc-700 bg-transparent'}`}
                  >
                    {rememberMe && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                  Remember me
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-white font-medium ${theme.gradient} ${theme.bgHover} ${theme.ringFocus} disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg ${theme.shadowColor} hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                {isSignUp ? (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <p className="text-sm text-zinc-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={onToggleMode}
              className={`${theme.textColor} ${theme.textHover} font-medium hover:underline transition-colors cursor-pointer`}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
