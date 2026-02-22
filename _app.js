import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // 1. Define which pages are "Secret"
    const protectedRoutes = ['/details', '/schedule', '/rsvp'];
    
    // 2. Check if the user is trying to access a secret page
    const isProtectedRoute = protectedRoutes.includes(router.pathname);

    if (isProtectedRoute) {
      const auth = localStorage.getItem('wedding_auth');
      const expiry = localStorage.getItem('expiry');

      // 3. If no auth OR if the 7-day invite has expired, boot them to /invite
      if (!auth || (expiry && Date.now() > parseInt(expiry))) {
        localStorage.removeItem('wedding_auth');
        localStorage.removeItem('expiry');
        router.push('/invite');
      }
    }
  }, [router.pathname]); // Runs every time the URL changes

  return <Component {...pageProps} />;
}

export default MyApp;
