import { Download } from "lucide-react";
import React from "react";

const DownloadButton = ({ songURL, songName }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(songURL);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const fileName = songName.endsWith(".mp3") ? songName : `${songName}.mp3`;

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button onClick={handleDownload}>
      <Download className="text-neutral-400 cursor-pointer transition-all active:scale-95 size-[18px]" />
    </button>
  );
};

export default DownloadButton;
