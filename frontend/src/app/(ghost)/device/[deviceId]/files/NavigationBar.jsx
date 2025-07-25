import { IoIosArrowForward } from "react-icons/io";
import { IoMdRefresh } from "react-icons/io";
import React from 'react'
import { ClipLoader } from "react-spinners";
import { useFileStore } from '@/store/slices/ActiveConnection/FileSlice';
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { toast } from "sonner";

const Navigator = ({ max_visible, className}) => {
  const { currentFilePath, setCurrentFilePath  } = useFileStore();
  const handleNavigationClick = (folder) => {
    const folderIndex = currentFilePath.indexOf(folder);
    if (folderIndex !== -1) {
      const newPath = currentFilePath.slice(0, folderIndex + 1);
      setCurrentFilePath(newPath);
    }
  }
  const visibleFolders = currentFilePath.length > max_visible
    ? currentFilePath.slice(currentFilePath.length - max_visible)
    : currentFilePath;

  return (
    <div className={`flex items-center ${className}`}>
      {currentFilePath.length > max_visible && (
        <div className="flex items-center gap-0">
          <p className="text-lg text-white/70 px-1 rounded-md">...</p>
          <IoIosArrowForward className="text-lg text-white/50" />
        </div>
      )}
      <div className="flex items-center py-2 overflow-x-auto whitespace-nowrap w-full">
        {visibleFolders.map((folder, idx) => {
          return (
            <div className="flex items-center gap-0" key={folder + idx}>
              <p
                className={`text-lg ${folder === visibleFolders[visibleFolders.length - 1] ? "text-white" : "text-white/70"} hover:bg-dark-3 hover:text-white cursor-pointer px-1 rounded-md truncate max-w-35`}
                onClick={() => { handleNavigationClick(folder); }}
              >
                {folder}
              </p>
              <IoIosArrowForward className={`text-lg ${folder === visibleFolders[visibleFolders.length - 1] ? "text-white" : "text-white/50"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NavigationBar = () => {
  const { tcpDataChannel } = useStreamsAndConnectionStore();
  const { currentFilePath, isRefreshing, setIsRefreshing} = useFileStore();

    const handleRefresh = () => {
        if (!tcpDataChannel) {
            toast.error("You are not connected to device");
            return;
        }
        setIsRefreshing(true);
        tcpDataChannel.send(JSON.stringify({type: "get_files", path: currentFilePath}));
    }

return (
  <div className="flex items-center py-2 overflow-x-auto whitespace-nowrap w-full">
    {!isRefreshing ? (
      <IoMdRefresh className="w-5 h-5 p-1 box-content active:scale-95 text-lg text-white/70 rounded-md hover:text-white hover:bg-dark-3 cursor-pointer mr-1"
        onClick={handleRefresh}
      />
    ) : (
      <div className='p-1 flex justify-center items-center'>
        <ClipLoader color={"#FFFFFF80"} loading={true} size={20} aria-label="Loading Spinner" data-testid="loader" />
      </div>
    )}
    
    <Navigator max_visible={2} className="flex sm:hidden"/>
    <Navigator max_visible={3} className="hidden sm:flex lg:hidden"/>
    <Navigator max_visible={4} className="hidden lg:flex xl:hidden"/>
    <Navigator max_visible={5} className="hidden xl:flex 2xl:hidden"/>
    <Navigator max_visible={6} className="hidden 2xl:flex 3xl:hidden"/>
    <Navigator max_visible={7} className="hidden 3xl:flex 4xl:hidden"/>
    <Navigator max_visible={8} className="hidden 4xl:flex 5xl:hidden"/>
    <Navigator max_visible={9} className="hidden 5xl:flex 6xl:hidden"/>

  </div>
);
}

export default NavigationBar