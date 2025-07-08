import { IoIosArrowForward } from "react-icons/io";
import { IoMdRefresh } from "react-icons/io";
import React from 'react'
import { ClipLoader } from "react-spinners";
import { useFileStore } from '@/store/slices/ActiveConnection/FileSlice';
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";


const NavigationBar = () => {
  const { tcpDataChannel } = useStreamsAndConnectionStore();
  const { currentFilePath, setCurrentFilePath, isRefreshing, setIsRefreshing} = useFileStore();
  const handleNavigationClick = (folder) => {
    const folderIndex = currentFilePath.indexOf(folder);
    if (folderIndex !== -1) {
      const newPath = currentFilePath.slice(0, folderIndex + 1);
      setCurrentFilePath(newPath);
    }
  }

    const handleRefresh = () => {
        setIsRefreshing(true);
        tcpDataChannel.send(JSON.stringify({type: "get_files", path: currentFilePath}));
    }

  return (
    <div className="flex items-center py-2">
        { !isRefreshing?
        <IoMdRefresh className="w-5 h-5 p-1 box-content active:scale-95 text-lg text-white/50 rounded-md hover:text-white hover:bg-gray-800 cursor-pointer mr-2"
        onClick={handleRefresh}/>
        :
        <div className='p-1 flex justify-center items-center'>
            <ClipLoader
            color={"#FFFFFF80"}
            loading={true}
            // cssOverride={override}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
            
        />
        </div>
        
        }
        {currentFilePath.map((folder) => {
            const isCurrentFloder = folder === currentFilePath[currentFilePath.length - 1];
        return (
          <div className="flex items-center gap-0" key={[...currentFilePath, folder]}>
            <p className={`text-lg ${isCurrentFloder ? "text-white" : "text-white/50"} 
            hover:bg-gray-800 cursor-pointer px-2 rounded-md`} onClick={() => {handleNavigationClick(folder)}}>
            {folder}</p>
            <IoIosArrowForward className={`text-lg ${isCurrentFloder ? "text-white" : "text-white/50"}`} />
          </div>
        )})}
    </div>
  )
}

export default NavigationBar