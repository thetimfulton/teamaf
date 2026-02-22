import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <Head>
        <title>Tim & Stef | We're Getting Married!</title>
      </Head>

      <main className="max-w-2xl animate-in fade-in duration-1000">
        <span className="uppercase tracking-[0.3em] text-sm mb-4 block text-slate-500">Save the Date</span>
        <h1 className="text-6xl md:text-8xl mb-6 text-slate-800">Tim & Stef</h1>
        
        <p className="text-lg md:text-xl font-light leading-relaxed mb-12 text-slate-600 italic">
          We’re so excited to share our day with you. <br/>
          Check back here for updates as we get closer to the big day!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a href="/invite" className="w-full sm:w-auto px-10 py-4 bg-[#8A9A5B] text-white hover:bg-opacity-90 transition-all rounded-full shadow-md font-medium">
            Check Invitation
          </a>
          <a href="#" className="w-full sm:w-auto px-10 py-4 border border-slate-300 text-slate-700 hover:bg-white transition-all rounded-full font-medium">
            Registry
          </a>
        </div>
      </main>

      <footer className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-slate-300 mb-2"></div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Made with love • Tim & Stef</p>
      </footer>
    </div>
  );
}
