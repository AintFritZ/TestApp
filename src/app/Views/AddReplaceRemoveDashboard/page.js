'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchFiles, uploadFile, removeFile } from "@/lib/AddRemoveFileFromBucket";
import Sidebar from "@/lib/Sidebar";
import { useRouter } from "next/navigation";
import styles from "../../../CSS/AddReplaceRemoveDashboard.module.css";

export default function Admin() {
  const [files, setFiles] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchFiles(setFiles);
  }, []);

  const handleFileSelect = (event) => {
    const fileName = event.target.value;
    const file = files.find((f) => f.name === fileName);
    setSelectedFileName(fileName);
    setSelectedFileUrl(file ? file.publicUrl : "");
  };

  const handleLogout = () => {
    // Implement any additional logout logic here, such as clearing auth tokens.
    router.push('/');
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      {/* Background Image */}
      <div className={styles.background}>
        <Image src="/PastelBG.jpg" alt="Background" fill objectFit="cover" priority />
      </div>

      {/* Main Container */}
      <div className={styles.container}>
        {/* Logout Button positioned at the top right */}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>

        {/* File Dropdown Selection */}
        <div className={styles.fileSelectBar}>
          <select className={styles.fileDropdown} onChange={handleFileSelect} value={selectedFileName}>
            <option value="">Select a file</option>
            {files.map((file) => (
              <option key={file.name} value={file.name}>
                {file.name}
              </option>
            ))}
          </select>
        </div>

        {/* Centered File Viewer */}
        <div className={styles.fileContainer}>
          {selectedFileUrl && <iframe src={selectedFileUrl} className={styles.pdfViewer}></iframe>}
        </div>

        {/* File Upload & Remove Buttons */}
        <div className={styles.buttonContainer}>
          <button className={styles.actionButton} onClick={() => uploadFile(setFiles)}>
            ADD FILE
          </button>
          <button className={styles.actionButton} onClick={() => removeFile(selectedFileName, setFiles, setSelectedFileName, setSelectedFileUrl)}>
            REMOVE FILE
          </button>
        </div>
      </div>
    </div>
  );
}
