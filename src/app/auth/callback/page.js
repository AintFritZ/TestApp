"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveUserSession } from "@/lib/SaveUser";
import { supabase } from "@/app/utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        router.push("/login");
        return;
      }

      if (session) {
        const userData = await saveUserSession(session);

        if (!userData) {
          router.push("/login");
          return;
        }

        // Redirect based on role
        if (userData.role === "Super Admin") {
          router.push("/Views/AdminDashboard");
        } else if (userData.role === "admin") {
          router.push("/Views/AdminDashboard");
        } else {
          router.push("/Views/LandingPage");
        }
      }
    };

    handleAuth();
  }, [router]);

  return <div>Loading...</div>;
}