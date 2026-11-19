import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';

export const ContactPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    dispatch(showToast({ type: 'success', message: 'Your message has been received! Our support team will respond shortly.' }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
          Contact MITAHARA
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Have queries about our organic sourcing, order delivery status, or custom meal subscriptions? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="md:col-span-5 bg-emerald-950 text-emerald-100 p-8 rounded-3xl space-y-6 shadow-xl">
          <h3 className="text-xl font-serif font-bold text-white">Direct Connect</h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            Reach our customer experience team directly for instant support or partnership enquiries.
          </p>

          <div className="space-y-4 text-xs pt-2">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-400 block text-[10px] uppercase font-bold">Email Us</span>
                <span className="font-semibold text-white">manoharthappetla@gmail.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-400 block text-[10px] uppercase font-bold">Call / WhatsApp</span>
                <span className="font-semibold text-white">+91 98765 43210</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-400 block text-[10px] uppercase font-bold">Kitchen & HQ</span>
                <span className="font-semibold text-white">Plot 42, Hitech City Main Road, Madhapur, Hyderabad, Telangana 500081</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Message Dispatched</h3>
              <p className="text-xs text-slate-500">
                Thank you for contacting MITAHARA. We will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Message / Question *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist your healthy diet journey?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
