import { FaDownload } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { RiDeleteBin6Fill } from "react-icons/ri";
import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFileStore } from '@/store/slices/ActiveConnection/FileSlice';
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";


const OptionsBar = () => {
    const {tcpDataChannel} = useStreamsAndConnectionStore()
    const {selectedFiles, setSelectedFiles,setIsRefreshing, currentFilePath, setDownloadedFileSize,
         isDownloading, setDownloadProgress, setIsDownloading, setNumDownloadingFiles} = useFileStore();

    const handleDownload = () => {
        if (isDownloading) {
            console.error("Already downloading files");
            return;
        }
        setIsDownloading(true);
        setDownloadProgress(0);
        setDownloadedFileSize(0);
        setNumDownloadingFiles(selectedFiles.length);
        tcpDataChannel.send(JSON.stringify({
            type: "download_files",
            files: selectedFiles,
            path: currentFilePath
        }));
    }

    const handleDelete = () => {
        setIsRefreshing(true);
        tcpDataChannel.send(JSON.stringify({
            type: "delete_files",
            files: selectedFiles,
            path: currentFilePath
        }));
    }

  return (
    <div className={`${selectedFiles.length === 0 ? "hidden": "flex items-center"} transition-opacity duration-3000
     bg-dark-3 rounded-lg p-1 border-[1px] border-dark-4 mr-2`}>
        <Tooltip>
            <TooltipTrigger asChild>
                <AiOutlineClose onClick={() => setSelectedFiles([])} 
                className='p-1 w-6 h-6 hover:bg-gray-800 rounded-md cursor-pointer text-white/50'/>
            </TooltipTrigger>
            <TooltipContent>
                <div className='rounded-sm bg-dark-5 p-2'>Close</div>
            </TooltipContent>
        </Tooltip>
        <p className='text-white/50 cursor-context-menu pl-3 pr-2'>{selectedFiles.length + " selected"}</p>
        <div className='flex items-center gap-2'>
            <Tooltip>
                <TooltipTrigger asChild>
                    <FaDownload onClick={handleDownload} className='p-1 w-6 h-6 hover:bg-gray-800 rounded-md cursor-pointer text-white/50'/>
                </TooltipTrigger>
                <TooltipContent>
                    <div className='rounded-sm bg-dark-5 p-2'>Download</div>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <RiDeleteBin6Fill onClick={handleDelete} className='p-1 w-6 h-6 hover:bg-gray-800 rounded-md cursor-pointer text-white/50'/>
                </TooltipTrigger>
                <TooltipContent>
                    <div className='rounded-sm bg-dark-5 p-2'>Delete</div>
                </TooltipContent>
            </Tooltip>
        </div>
    </div>
  )
}

export default OptionsBar   