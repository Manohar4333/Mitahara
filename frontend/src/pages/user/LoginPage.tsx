import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, Leaf, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { sendOtp, verifyOtp, clearAuthError, resetOtpState, decrementCooldown } from '../../store/slices/authSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { fetchCart } from '../../store/slices/cartSlice.js';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '/';
  const { isAuthenticated, user, otpSent, otpCooldown, loading, error, devOtp } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  }, [isAuthenticated, user, redirect, navigate]);

  // Handle countdown timer
  useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        dispatch(decrementCooldown());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown, dispatch]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      dispatch(showToast({ type: 'error', message: 'Please provide a valid email address.' }));
      return;
    }
    const res = await dispatch(sendOtp(email));
    if (sendOtp.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Verification code sent to your email.' }));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      dispatch(showToast({ type: 'error', message: 'Please enter the 6-digit OTP.' }));
      return;
    }

    const res = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: `Welcome, ${res.payload.name}!` }));
      dispatch(fetchCart());
      if (res.payload.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-green-800 p-8 text-white text-center relative">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Leaf className="w-6 h-6 text-lime-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide">Welcome to MITAHARA</h2>
          <p className="text-xs text-emerald-100 mt-1">Sign in with Email OTP for pure, organic living</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  No password needed. We'll send a 6-digit one-time passcode to your inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Are you an admin? Enter <strong>admin@mitahara.online</strong> to access the management portal.
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => dispatch(resetOtpState())}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>Code sent to {email}</span>
                  {otpCooldown > 0 ? (
                    <span className="text-amber-600 font-semibold">Resend in {otpCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {devOtp && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <span>Dev/Testing Code: <strong>{devOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtp)}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                    >
                      Auto Fill
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
