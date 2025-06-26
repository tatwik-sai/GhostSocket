'use client';

import { FaWindows } from "react-icons/fa";
import { Button } from "./ui/button";

export default function DownloadButton() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/root_page/ghost-setup.exe';
    link.download = 'ghost-setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button className="red-primary-button text-xl w-2/5" onClick={handleDownload}>
        <FaWindows className="w-[15px] h-[15px]" />
        Download
    </Button>
  );
}
