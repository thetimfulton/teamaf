import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Invite() {
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error
  const router = useRouter();

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!lastName) return;
    
    setStatus('loading');
    
    try {
      // REPLACE with your Google Apps Script Web App URL
      const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbBGgUusSBr1COhP9vymPwasGjKLwz9Igrpgewl493QLO2oBIs9CutQhL86J-nr0LiQ/exec";
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ 
          lastName: lastName,
          userAgent: navigator.userAgent
        })
      });
      
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('wedding_auth', 'true');
        localStorage.setItem('expiry', Date.now() + (7 * 24 * 60 * 60 * 1000));
        router.push('/details');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="max-w-md w-full p-12 bg-white shadow-xl rounded-sm border border-slate-50 text-center">
        <h2 className="text-3xl font-serif mb-4 text-slate-800">Find Your Invite</h2>
        <p className="text-slate-500 mb-8 font-light italic">Please enter the last name as it appears on your invitation.</p>
        
        <form onSubmit={handleCheck} className="space-y-6">
          <input 
            type="text" 
            placeholder="Last Name"
            className="w-full border-b border-slate-200 py-3 text-center text-xl focus:border-[#8A9A5B] outline-none transition-colors"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          
          {status === 'error' && (
            <p className="text-rose-400 text-sm italic">We couldn’t find that name. Please check your spelling.</p>
          )}

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 bg-slate-800 text-white tracking-widest uppercase text-xs hover:bg-slate-700 transition-all disabled:bg-slate-300"
          >
            {status === 'loading' ? 'Checking...' : 'Enter'}
          </button>
        </form>
        
        <a href="mailto:timandstef@example.com" className="block mt-8 text-xs text-slate-400 underline underline-offset-4">
          Need help? Contact us
        </a>
      </div>
    </div>
  );
}
