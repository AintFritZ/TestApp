"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { saveUserSession, handleGoogleLogin } from "@/lib/SaveUser";
import styles from "@/app/page.module.css"; // Import CSS module

export default function LoginPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }
      setSession(data?.session);
      if (data?.session) {
        await saveUserSession(data.session, router);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!newSession) {
          console.warn("Auth state changed, but no session found.");
          return;
        }
        setSession(newSession);
        await saveUserSession(newSession, router);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.loginTitle}>
          <img src="/NEULogo.png" alt="NEU Logo" className={styles.titleLogo} />
          NEUCompare
        </h1>
        <div className={styles.buttonContainer}>
          <button className={styles.loginButton} onClick={handleGoogleLogin}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
