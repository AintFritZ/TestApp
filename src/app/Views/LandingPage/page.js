"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../../CSS/LandingPage.module.css";
import { uploadFile, deleteFile } from "@/lib/UploadFile";
import { fetchBucketFiles } from "@/lib/FetchBucketFiles";
import { supabase } from "@/app/utils/supabaseClient";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [bucketFiles, setBucketFiles] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  // On mount: check for any stored file name and fetch bucket files
  useEffect(() => {
    const storedFileName = localStorage.getItem("uploadedFileName");

    if (storedFileName) {
      (async () => {
        await deleteFile(storedFileName);
        localStorage.removeItem("uploadedFileName");
        setFileUrl("");
      })();
    }

    // Fetch files from the bucket
    const fetchFiles = async () => {
      const files = await fetchBucketFiles();
      setBucketFiles(files);
    };

    fetchFiles();
  }, []);

  // Handle file upload (or replacement)
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      console.error("Only PDF files are allowed.");
      return;
    }

    setUploadedFile(file);

    // If replacing an existing file, delete the old one first
    if (isReplacing && uploadedFileName) {
      const deleteResponse = await deleteFile(uploadedFileName);
      if (deleteResponse.error) {
        console.error("Error replacing file, deletion failed:", deleteResponse.error);
      } else {
        console.log("Old file replaced successfully");
      }
      localStorage.removeItem("uploadedFileName");
    }

    try {
      const uploadResponse = await uploadFile(file);
      if (uploadResponse.error) {
        console.error("File upload failed:", uploadResponse.error);
      } else {
        console.log("File uploaded successfully:", uploadResponse.url);
        setFileUrl(uploadResponse.url);
        setUploadedFileName(uploadResponse.fileName);
        localStorage.setItem("uploadedFileName", uploadResponse.fileName);
      }
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
    }

    if (isReplacing) {
      setIsReplacing(false);
    }
  };

  // Handle file selection from the dropdown
  const handleSelectFile = (event) => {
    setSelectedFileUrl(event.target.value);
  };

  // Trigger file input for replacing file
  const handleReplaceFile = () => {
    if (!fileInputRef.current) return;
    setIsReplacing(true);
    fileInputRef.current.click();
  };

  // Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className={styles.page}>
      {/* Background Image */}
      <div className={styles.background}>
        <Image src="/PastelBG.jpg" alt="Background" fill objectFit="cover" priority />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/NEULogo.png" alt="Neu Logo" width={50} height={50} />
          <span className={styles.title}>NeuCompare</span>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Containers */}
      <div className={styles.container}>
        {/* LEFT CONTAINER: Uploaded file & buttons */}
        <div className={styles.rightContainer}>
          {/* File Selection Bar */}
          <div className={styles.fileSelectBar}>
            {!fileUrl ? (
              <button
                className={styles.uploadButton}
                onClick={() => fileInputRef.current.click()}
              >
                Upload File
              </button>
            ) : (
              <button
                className={styles.uploadButton}
                onClick={handleReplaceFile}
              >
                Replace File
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="application/pdf"
            onChange={handleFileChange}
          />

          <div className={styles.fileContainer}>
            {fileUrl && <iframe src={fileUrl} className={styles.pdfViewer}></iframe>}
          </div>
        </div>

        {/* RIGHT CONTAINER: File selection and viewer */}
        <div className={styles.rightContainer}>
          <div className={styles.fileSelectBar}>
            <select
              className={styles.fileSelectDropdown}
              onChange={handleSelectFile}
              defaultValue=""
            >
              <option value="" disabled>
                Select a file
              </option>
              {bucketFiles.map((file) => (
                <option key={file.name} value={file.publicUrl}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fileContainer}>
            {selectedFileUrl && <iframe src={selectedFileUrl} className={styles.pdfViewer}></iframe>}
          </div>
        </div>
      </div>
    </div>
  );
}