export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
      <section className="animate-fadeIn">
        <h1 className="font-serif text-6xl md:text-8xl text-slate-800 mb-4">Tim & Stef</h1>
        <p className="text-xl italic font-light tracking-wide text-slate-600 mb-12">
          We’re getting married!
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href="/invite" className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 transition-all rounded-sm">
            Check Invitation
          </a>
          <a href="https://zola.com/registry/placeholder" className="px-8 py-3 border border-slate-300 hover:bg-white transition-all rounded-sm">
            Registry
          </a>
        </div>
      </section>

      <footer className="absolute bottom-8 text-sm uppercase tracking-widest text-slate-400">
        [Date] • [City, State]
      </footer>
    </main>
  );
}
