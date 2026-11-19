import React from 'react';
import { Leaf, Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
          Our Heritage & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
          About MITAHARA
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Rooted in the Sanskrit principle of <em>Mita-Ahara</em> (measured, moderate, wholesome diet), our quest is to revive ancient nutrition for contemporary vitality.
        </p>
      </div>

      {/* Founder Spotlight matching reference site */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-emerald-600 shadow-xl shrink-0 bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
            alt="Mitahara Founder"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-3 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Vision & Leadership</span>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Crafted with Pure Passion</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            "We started MITAHARA because modern supermarket shelves were overwhelmed with ultra-processed flours, synthetic stabilizers, and hidden sugars. Our mission is pure transparency: unpolished indigenous millets, stone-ground flatbreads, and freshly pressed juices that support genuine cellular wellness."
          </p>
          <p className="text-xs font-bold text-emerald-800">— Manohar Thappetla, Founder</p>
        </div>
      </div>

      {/* Pillars of Purity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Leaf className="w-6 h-6 text-emerald-700 mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">Farm Traceability</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every grain of millet, ragi, and sorghum is sourced directly from sustainable organic cooperatives.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <ShieldCheck className="w-6 h-6 text-emerald-700 mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">Zero Preservatives</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No synthetic stabilizers or emulsifiers. Prepared fresh and delivered promptly in biodegradable packaging.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Heart className="w-6 h-6 text-emerald-700 mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">Nutrient Density</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            High natural fiber, balanced glycemic index, and essential micro-minerals that sustain balanced vitality.
          </p>
        </div>
      </div>
    </div>
  );
};
