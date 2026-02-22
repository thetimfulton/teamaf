import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Replace with your URL from Google Apps Script (ends in /exec)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpLH994-0GMJv7pyyGGaif3o-2g2j87UQsiXgr21v9zmoK4AbuXenPVvN65L7pW_85rA/exec";

export default function InviteGate() {
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('idle');
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('wedding_auth');
    const expiry = localStorage.getItem('expiry');
    if (auth && expiry && Date.now() < parseInt(expiry)) {
      router.push('/details');
    }
  }, [router]);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!lastName.trim()) return;
    setStatus('loading');

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          lastName: lastName.trim(),
          userAgent: navigator.userAgent
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        localStorage.setItem('wedding_auth', 'true');
        localStorage.setItem('expiry', (Date.now() + 604800000).toString());
        setTimeout(() => router.push('/details'), 800);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-[#2C3E50]">
      <Head>
        <title>Invitation | Tim & Stef</title>
      </Head>

      <div className="max-w-md w-full bg-white p-10 shadow-sm border border-slate-100 rounded-sm">
        <header className="text-center mb-10">
          <h1 className="font-serif text-3xl mb-3">Welcome</h1>
          <p className="text-slate-500 font-light italic text-sm">
            Enter the last name on your invitation.
          </p>
        </header>

        <form onSubmit={handleCheck} className="space-y-8">
          <div className="relative">
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Last Name"
              className="w-full bg-transparent border-b border-slate-200 py-3 text-center text-xl outline-none focus:border-[#8A9A5B]"
              required
            />
            {status === 'error' && (
              <p className="text-rose-400 text-xs mt-4 text-center">
                We couldn’t find that name. Please check spelling.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full py-4 bg-[#2C3E50] text-white tracking-widest uppercase text-xs hover:bg-slate-700 disabled:opacity-50 transition-all"
          >
            {status === 'loading' ? 'Searching...' : status === 'success' ? 'Success' : 'Check Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
}
