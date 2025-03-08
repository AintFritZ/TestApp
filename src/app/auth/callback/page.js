"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserSession } from '@/lib/SaveUser';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        router.push('/login');
        return;
      }

      if (session) {
        const userData = await saveUserSession(session);
        router.push(userData?.role === 'admin' 
          ? '/Views/AdminDashboard' 
          : '/Views/LandingPage');
      }
    };

    handleAuth();
  }, [router]);

  return <div>Loading...</div>;
}
