import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with session persistence
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);

// Upload File with User ID and Owner Info
export async function uploadFile(file) {
  if (!file) return { error: "No file provided" };

  // Get current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData?.session?.user?.id) {
    console.error("User authentication failed:", sessionError);
    return { error: "User must be logged in to upload files." };
  }

  const user = sessionData.session.user;
  const userId = user.id;
  const userEmail = user.email || "Unknown"; // Use email as file owner
  const fileName = `${userId}_${Date.now()}_${file.name}`;
  const filePath = `user_uploads/${fileName}`;

  console.log("Uploading file:", fileName);

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("transferee_curriculum")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error("Upload Error:", error.message);
    return { error: "Failed to upload file to storage." };
  }

  // Retrieve public URL
  const { data: publicUrlData } = supabase.storage
    .from("transferee_curriculum")
    .getPublicUrl(filePath);

  const publicURL = publicUrlData.publicUrl;

  if (!publicURL) {
    console.error("Failed to retrieve file URL.");
    return { error: "Failed to retrieve file URL." };
  }

  console.log("File uploaded successfully:", publicURL);

  // Save file details in the database
  const { error: dbError } = await supabase
    .from("uploaded_files")
    .insert([
      {
        user_id: userId,
        file_owner: userEmail, // Store file owner's email
        file_name: fileName,
        file_url: publicURL,
        uploaded_at: new Date(),
      },
    ]);

  if (dbError) {
    console.error("Database Insert Error:", dbError.message);
    return { error: "Failed to save file in database." };
  }

  return { url: publicURL, fileName, fileOwner: userEmail };
}

// Delete File from Supabase
export async function deleteFile(fileName) {
  if (!fileName) return { error: "File name is required for deletion." };

  // Get current session to identify the user
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData?.session?.user?.id) {
    console.error("User authentication failed:", sessionError);
    return { error: "User must be logged in to delete files." };
  }

  const userId = sessionData.session.user.id;
  const filePath = `user_uploads/${fileName}`;

  console.log("Deleting file:", filePath);

  // Remove file from storage
  const { error: storageError } = await supabase.storage
    .from("transferee_curriculum")
    .remove([filePath]);

  if (storageError) {
    console.error("File deletion failed:", storageError.message);
    return { error: "Failed to delete file from storage." };
  }

  console.log("File deleted successfully");

  // Remove file entry from database
  const { error: dbError } = await supabase
    .from("uploaded_files")
    .delete()
    .eq("user_id", userId)
    .eq("file_name", fileName);

  if (dbError) {
    console.error("Failed to delete file from database:", dbError.message);
    return { error: "Failed to remove file record from database." };
  }

  console.log("File record removed from database.");
  return { success: true };
}