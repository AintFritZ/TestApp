import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchFiles = async (setFiles) => {
    const { data, error } = await supabase.storage.from("neu_curriculum").list();
    if (error) {
      console.error("Error fetching files:", error.message);
      return;
    }
  
    // Filter out unwanted placeholder files
    const filesWithUrls = data
      .filter((file) => !file.name.startsWith("."))
      .map((file) => ({
        name: file.name,
        publicUrl: `${supabaseUrl}/storage/v1/object/public/neu_curriculum/${file.name}`,
      }));
  
    setFiles(filesWithUrls);
  };  

export const uploadFile = async (setFiles) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/pdf";

  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const { data, error } = await supabase.storage.from("neu_curriculum").upload(file.name, file);

    if (error) {
      console.error("Upload error:", error.message);
      return;
    }

    console.log("File uploaded successfully:", data);
    fetchFiles(setFiles);
  };

  fileInput.click();
};

export const removeFile = async (fileName, setFiles, setSelectedFileName, setSelectedFileUrl) => {
  if (!fileName) {
    alert("Please select a file to remove.");
    return;
  }

  const { error } = await supabase.storage.from("neu_curriculum").remove([fileName]);

  if (error) {
    console.error("Error removing file:", error.message);
    return;
  }

  console.log("File removed successfully:", fileName);
  setSelectedFileName("");
  setSelectedFileUrl("");
  fetchFiles(setFiles);
};
