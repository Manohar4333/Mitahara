import React from 'react';
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';

export const BlogsPage: React.FC = () => {
  const blogs = [
    {
      id: 1,
      title: 'The Science of Mitahara: How Ancient Vedic Portioning Prevents Metabolic Slumps',
      excerpt: 'Learn the foundational philosophy of eating until half your stomach is filled with wholesome solids, one-quarter with pure liquids, leaving the remainder for breath.',
      date: 'November 14, 2026',
      author: 'Dr. Radhika Iyer, Clinical Ayurvedic Nutritionist',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      category: 'Ayurvedic Principles',
    },
    {
      id: 2,
      title: 'Why Switching from Hybrid Wheat to Native Jowar and Ragi Rotis Transforms Digestion',
      excerpt: 'Gluten sensitivity and digestive lethargy are rampant today. Here is what happens to your gut microbiome and insulin sensitivity when you switch to traditional Sorghum and Finger Millet.',
      date: 'November 08, 2026',
      author: 'Manohar Thappetla',
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
      category: 'Gluten Free Living',
    },
    {
      id: 3,
      title: 'Cold-Pressed Juicing vs High-Speed Centrifugal: The Live Enzyme Difference',
      excerpt: 'Heat destroys sensitive phytonutrients and vitamins. Discover why hydraulic cold-pressing yields bioactive chlorophyll and true cellular hydration without oxidation.',
      date: 'October 28, 2026',
      author: 'Mitahara Nutrition Lab',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
      category: 'Cellular Detox',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
          Wellness Knowledge Hub
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
          Mindful Living Articles
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Deep-dives into indigenous superfoods, nutrition science, and mindful eating habits.
        </p>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <article
            key={blog.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group"
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            <div className="p-6 flex flex-col flex-1">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-2">
                {blog.category}
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 mb-2 leading-snug">
                {blog.title}
              </h2>
              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                {blog.excerpt}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{blog.date}</span>
                <span className="font-semibold text-emerald-700 group-hover:underline flex items-center gap-1">
                  Read Article <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
