import { useState } from 'react';
import { useRouter } from 'next/router';

export default function InviteGate() {
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheck = async () => {
    if (!lastName) return setError("Please enter a last name.");
    setLoading(true);
    
    try {
      const res = await fetch('YOUR_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({ lastName, userAgent: navigator.userAgent })
      });
      const data = await res.json();

      if (data.success) {
        // Set secure session (Local Storage for simplicity, or HttpOnly cookie for production)
        localStorage.setItem('wedding_auth', 'true');
        localStorage.setItem('expiry', Date.now() + 604800000); // 7 days
        router.push('/details');
      } else {
        setError("We couldn’t find that name. Please check spelling or contact us.");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-sm border border-slate-100">
        <h2 className="font-serif text-3xl text-center">Find Your Invitation</h2>
        <p className="text-center text-slate-500 text-sm">Enter the last name on your invitation envelope.</p>
        
        <input 
          type="text" 
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border-b border-slate-300 py-2 focus:border-sage outline-none text-center text-xl"
          placeholder="Last Name"
        />
        
        {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
        
        <button 
          onClick={handleCheck}
          disabled={loading}
          className="w-full bg-slate-800 text-white py-3 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Checking..." : "View Details"}
        </button>
      </div>
    </div>
  );
}
