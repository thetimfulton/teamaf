import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// --- CONFIGURATION ---
// Replace this with your URL from Google Apps Script (ends in /exec)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpLH994-0GMJv7pyyGGaif3o-2g2j87UQsiXgr21v9zmoK4AbuXenPVvN65L7pW_85rA/exec";

export default function InviteGate() {
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error, success
  const router = useRouter();

  // 1. If they are already authorized, send them straight to details
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
      // We send as text/plain to avoid CORS "pre-flight" blocks from Google
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          lastName: lastName.trim(),
          userAgent: navigator.userAgent,
          page: "/invite"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        // Set the 7-day session
        localStorage.setItem('wedding_auth', 'true');
        localStorage.setItem('expiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
        
        // Brief delay for the success animation before redirect
        setTimeout(() => {
          router.push('/details');
        }, 800);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-[#2C3E50]">
      <Head>
        <title>Invitation | Tim & Stef</title>
      </Head>

      <div className="max-w-md w-full bg-white p-10 md:p-14 shadow-sm border border-slate-100 rounded-sm animate-in
