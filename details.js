/* Placeholder Content Sections */
const DetailSection = ({ title, children }) => (
  <section className="py-12 border-b border-slate-100">
    <h3 className="font-serif text-2xl mb-6 text-slate-700">{title}</h3>
    <div className="text-slate-600 leading-relaxed">{children}</div>
  </section>
);

export default function Details() {
  // Use a useEffect hook to check localStorage. 
  // If no auth, redirect to /invite.

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center font-serif">
          <span>T + S</span>
          <div className="space-x-6 text-sm uppercase tracking-widest hidden md:block">
            <a href="#schedule">Schedule</a>
            <a href="#travel">Travel</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-20">
        <header className="text-center mb-20">
          <h1 className="font-serif text-5xl mb-4">The Celebration</h1>
          <p className="italic underline underline-offset-8 decoration-sage">[Wedding Date]</p>
        </header>

        <DetailSection title="When & Where">
          <p className="font-bold">[Ceremony Time]</p>
          <p>[Venue Name]</p>
          <p>[Venue Address]</p>
          <div className="mt-4 h-64 bg-slate-200 flex items-center justify-center text-xs">
            [Google Maps Embed Placeholder]
          </div>
        </DetailSection>

        <DetailSection title="The Schedule">
          <ul className="space-y-4">
            <li><strong>4:30 PM</strong> — Ceremony</li>
            <li><strong>5:00 PM</strong> — Cocktail Hour</li>
            <li><strong>6:30 PM</strong> — Dinner & Dancing</li>
          </ul>
        </DetailSection>

        <DetailSection title="Travel & Stay">
          <p className="mb-4">We have reserved a block of rooms at <strong>[Hotel Name]</strong>. Please use code "STEFANDTIM" when booking.</p>
          <p>Closest Airport: [Airport Name] ([Code])</p>
        </DetailSection>

        <DetailSection title="FAQ">
          <div className="space-y-6">
            <div>
              <p className="font-bold italic">Can I bring a guest?</p>
              <p>Due to venue capacity, we can only accommodate those listed on your invitation.</p>
            </div>
            <div>
              <p className="font-bold italic">What is the dress code?</p>
              <p>Cocktail Attire. Think elegant but comfortable enough to dance!</p>
            </div>
          </div>
        </DetailSection>
      </div>

      <footer className="py-20 text-center text-slate-400 text-sm">
        Made with love • Tim & Stef
      </footer>
    </div>
  );
}
