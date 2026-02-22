import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Details() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('wedding_auth');
    if (!auth) {
      router.push('/invite');
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return <div className="bg-[#FAF9F6] min-h-screen" />;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <nav className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-100 z-50 py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="font-serif text-xl">T & S</span>
          <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-slate-500">
            <a href="#schedule" className="hover:text-sage transition-colors">Schedule</a>
            <a href="#travel" className="hover:text-sage transition-colors">Travel</a>
            <a href="#faq" className="hover:text-sage transition-colors">FAQ</a>
            <a href="#registry" className="hover:text-sage transition-colors">Registry</a>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 mt-16 space-y-24">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-5xl font-serif mb-4">The Celebration</h1>
          <p className="text-slate-500 font-light">[Date] • [Venue Name]</p>
        </header>

        {/* When & Where */}
        <section id="location" className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-sage uppercase tracking-widest text-xs font-bold mb-4">When & Where</h3>
            <p className="text-2xl font-serif mb-2">[Wedding Date]</p>
            <p className="text-slate-600 mb-6 italic">[Ceremony Time]</p>
            <p className="text-slate-800">[Venue Name]<br/>[Venue Address]</p>
          </div>
          <div className="h-64 bg-slate-200 rounded-sm flex items-center justify-center italic text-slate-400">
            [Map Embed Placeholder]
          </div>
        </section>

        {/* Dress Code Section */}
        <section className="bg-white p-12 text-center border border-slate-100 shadow-sm">
          <h3 className="font-serif text-3xl mb-4">Dress Code</h3>
          <p className="text-slate-600 leading-relaxed max-w-lg mx-auto italic">
            "Cocktail Attire. We invite you to wear garden-inspired hues (Sage, Dusty Rose, or Soft Blues) to match the scenery."
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-8">
          <h3 className="text-sage uppercase tracking-widest text-xs font-bold">Frequently Asked Questions</h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="font-medium mb-2">Can I bring a guest?</p>
              <p className="text-sm text-slate-500 leading-relaxed">Due to venue capacity, we can only host those explicitly listed on your invitation.</p>
            </div>
            <div>
              <p className="font-medium mb-2">Are kids invited?</p>
              <p className="text-sm text-slate-500 leading-relaxed">We love your little ones, but our wedding will be an adults-only celebration.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-32 text-center border-t border-slate-200 pt-12 text-slate-400 text-xs tracking-widest uppercase">
        Made with love • Tim & Stef
      </footer>
    </div>
  );
}
