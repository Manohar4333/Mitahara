import React from 'react';
import { Settings, Mail, Truck, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
          Platform Configuration
        </span>
        <h2 className="text-2xl font-serif font-black text-slate-900">
          Store & System Settings
        </h2>
      </div>

      <div className="space-y-6">
        {/* Smtp Configuration Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Nodemailer SMTP Dispatch Settings</h3>
              <p className="text-xs text-slate-500">Official Gmail SMTP transmission configuration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">SMTP Host</span>
              <span className="font-mono text-slate-800">smtp.gmail.com:587</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">Sender Account</span>
              <span className="font-mono text-slate-800">manoharthappetla@gmail.com</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Credentials are kept securely in backend environment variables (`.env`) and never exposed to the client.
          </p>
        </div>

        {/* Pricing & Fee Rules Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Truck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Order Calculation & Delivery Rules</h3>
              <p className="text-xs text-slate-500">Fixed rules configured on the backend calculation engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">Fixed Delivery Charge</span>
              <span className="font-bold text-emerald-800 text-sm">₹24 per order</span>
              <p className="text-[11px] text-slate-500">Applied once per order, waived with Free Delivery coupons</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block font-semibold">GST (Goods & Services Tax)</span>
              <span className="font-bold text-emerald-800 text-sm">₹0 charged</span>
              <p className="text-[11px] text-slate-500">Zero additional sales tax charged at checkout</p>
            </div>
          </div>
        </div>

        {/* Security & Token Parameters */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Security & Authentication Parameters</h3>
              <p className="text-xs text-slate-500">OTP expiration, rate limiting and session policies</p>
            </div>
          </div>

          <ul className="text-xs space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span><strong>OTP Expiry:</strong> 5 minutes with SHA-256 hash storage & auto TTL purging</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span><strong>Resend Cooldown:</strong> 60 seconds strict rate limiting</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span><strong>Max Attempts:</strong> 5 incorrect attempts before invalidating OTP</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span><strong>Session Cookies:</strong> HTTP-only secure cookies with JWT accessToken and refreshToken</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
