import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoginForm } from '../components/auth/LoginForm';
import { AlertCircle } from 'lucide-react';
import imageLogin from '../assets/image02.png';
import imageSignUp from '../assets/image04.png';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    // Handle "Remember Me" functionality
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden">
      
      {/* Left Side - Image */}
      <div className="hidden lg:block w-1/2 relative bg-zinc-900 border-r-1 border-zinc-600">
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.8)_100%)]" />
        <img 
          src={isSignUp ? imageSignUp : imageLogin} 
          alt={isSignUp ? "Sign Up" : "Login"} 
          className="w-full h-full object-cover transition-opacity duration-500 saturate-60"
        />
        <div className="absolute bottom-10 left-10 z-20 text-white max-w-lg">
          <h2 className="text-3xl font-bold mb-4">
            {isSignUp ? "Join our Community" : "Welcome Back"}
          </h2>
          <p className="text-lg text-zinc-200 leading-relaxed">
            {isSignUp 
              ? "Start your journey with us today and discover amazing opportunities." 
              : "Access your dashboard to manage your projects and track your progress."}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-4">
          
          {/* Alert Messages */}
          <div className="space-y-2">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {message}
              </div>
            )}
          </div>

          <LoginForm 
            isSignUp={isSignUp}
            isLoading={isLoading}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            onSubmit={handleAuth}
            onToggleMode={() => setIsSignUp(!isSignUp)}
          />
        </div>
      </div>
    </div>
  );
}
