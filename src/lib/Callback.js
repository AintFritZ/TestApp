import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/app/utils/supabaseClient";
import { saveUserSession } from "@/lib/SaveUser"; // Adjust path as needed

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // This method extracts tokens from the URL hash and sets the session
      const { data, error } = await supabase.auth.getSessionFromUrl();
      
      if (error) {
        console.error("Error retrieving session from URL:", error.message);
        router.push("/");
        return;
      }

      const { session } = data;

      if (session) {
        // Save the user session details (update database, etc.)
        await saveUserSession(session, router);
      } else {
        console.error("No session found.");
        router.push("/");
      }
    };

    handleAuth();
  }, [router]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;