import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, ShieldCheck, ArrowRight, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { closeAuthModal, showToast } from '../../store/slices/uiSlice.js';
import { sendOtp, verifyOtp, clearAuthError, resetOtpState, decrementCooldown } from '../../store/slices/authSlice.js';
import { fetchCart } from '../../store/slices/cartSlice.js';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { authModalOpen, authRedirectPath } = useAppSelector((state) => state.ui);
  const { otpSent, otpCooldown, loading, error, devOtp } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Handle cooldown countdown
  useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        dispatch(decrementCooldown());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown, dispatch]);

  if (!authModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      dispatch(showToast({ type: 'error', message: 'Please enter a valid email address.' }));
      return;
    }
    const result = await dispatch(sendOtp(email));
    if (sendOtp.fulfilled.match(result)) {
      dispatch(showToast({ type: 'success', message: 'Verification code sent to your email.' }));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      dispatch(showToast({ type: 'error', message: 'Please enter the 6-digit OTP.' }));
      return;
    }

    const result = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      dispatch(showToast({ type: 'success', message: `Welcome to MITAHARA, ${result.payload.name}!` }));
      dispatch(closeAuthModal());
      dispatch(resetOtpState());
      dispatch(fetchCart());

      // Return user to their intended destination!
      if (authRedirectPath) {
        navigate(authRedirectPath);
      }
    }
  };

  const handleClose = () => {
    dispatch(closeAuthModal());
    dispatch(clearAuthError());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white hover:bg-emerald-700/50 p-1.5 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-lime-400"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">Instant Access</span>
          </div>
          <h2 className="text-2xl font-serif font-bold tracking-wide">MITAHARA</h2>
          <p className="text-xs text-emerald-100 mt-0.5">Pure, Balanced & Wholesome Organic Living</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <span className="font-semibold text-xs bg-red-200 px-1.5 py-0.5 rounded">Error</span>
              <span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            /* STEP 1: Enter Email */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  We will send a 6-digit verification code to sign in or create your MITAHARA account.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-50"
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

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>By continuing, you agree to MITAHARA's Terms of Service & Privacy Policy.</span>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => dispatch(resetOtpState())}
                    className="text-xs text-emerald-700 hover:underline font-medium"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>Sent to {email}</span>
                  {otpCooldown > 0 ? (
                    <span className="text-amber-600 font-medium">Resend in {otpCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Development helper badge if SMTP credentials are mock */}
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
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-50"
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
