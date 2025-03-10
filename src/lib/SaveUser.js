import { supabase } from "@/app/utils/supabaseClient";

// Returns the current Philippines time in ISO format with the +08:00 offset
export const getPHTime = () => {
  const options = { timeZone: "Asia/Manila", hour12: false };
  const phDateTime = new Date().toLocaleString("sv-SE", options);
  return `${phDateTime.replace(" ", "T")}+08:00`;
};

// Save user login details to Supabase
export const saveUserSession = async (session) => {
  if (!session?.user) {
    console.error("No session or user data provided.");
    return null;
  }

  const { user } = session;
  const phTimestamp = getPHTime();

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing user:", fetchError.message);
      return null;
    }

    // If user exists, keep their role; otherwise, set role to "user"
    const role = existingUser ? existingUser.role : "user";

    // Upsert user data
    const { data: userData, error } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "No Name",
          picture: user.user_metadata?.avatar_url || "",
          last_logged_in: phTimestamp,
          created_at: user.created_at,
          role: role, // Keep existing role or assign "user" for new accounts
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw new Error(`User update failed: ${error.message}`);
    return userData;

  } catch (error) {
    console.error("Error handling user session:", error.message);
    return null;
  }
};

// Google login function
export const handleGoogleLogin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" }
      }
    });

    if (error) throw new Error(`Google login failed: ${error.message}`);
    return data;

  } catch (error) {
    console.error("Login error:", error.message);
    return null;
  }
};