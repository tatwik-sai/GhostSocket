'use client';

import { FaWindows } from "react-icons/fa";
import { Button } from "./ui/button";

export default function DownloadButton({theme="purple"}) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/application/ghost-setup.exe';
    link.download = 'ghost-setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button className={`${theme === 'purple' ? "purple-primary-button" : "bg-dark-3"} text-white px-4 py-5 shadow-md cursor-pointer hover:scale-105 transition-all duration-300 text-lg w-2/7`} onClick={handleDownload}>
        <FaWindows className="w-[15px] h-[15px]" />
        Download
    </Button>
  );
}
