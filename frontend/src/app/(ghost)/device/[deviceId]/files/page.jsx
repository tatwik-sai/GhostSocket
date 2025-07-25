"use client"
import { useParams, useRouter} from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area"
import { fileIcons } from "./file-icons";
import NavigationBar from "./NavigationBar";
import { use, useEffect, useRef } from "react";
import OptionsBar from "./OptionsBar";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";
import ProgressBar from "@ramonak/react-progress-bar";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { useFileStore } from "@/store/slices/ActiveConnection/FileSlice";
import { useSocket } from "@/context/SocketContext";
import { useDeviceProfileStore } from "@/store/slices/ActiveConnection/DeviceProfileSlice";


function hasSubdirectories(files, path) {
  let current = files;
  
  for (const key of path) {
    current = current?.[key];
  }
  
  if (!current || typeof current !== 'object') return false;
  
  return Object.keys(current).some(key => !key.startsWith('*'));
}

const FilePage = () => {
  const { deviceId } = useParams();
  const {socket} = useSocket()
  const containerRef = useRef();
  const optionsRef = useRef();
  const clickTimer = useRef(null);
  const {tcpDataChannel} = useStreamsAndConnectionStore()
  const {files, selectedFiles, isDownloading, downloadProgress, setIsDownloading, numDownloadingFiles, setNumDownloadingFiles,
     setIsRefreshing, setSelectedFiles, currentFilePath, setCurrentFilePath, downloadedFileSize, downloadFileSize} = useFileStore();
  const router = useRouter()
  const {permissions} = useDeviceProfileStore();
  useEffect(() => {
      const {permissions} = useDeviceProfileStore.getState();
      if (permissions !== null && !permissions[3].value.allowed) {
          router.push(`/device/${deviceId}/device-profile`);
          toast.error("You do not have permission to access the Files.");
      }
  }, [permissions])
    

  useEffect(() => {
    if (socket?.current){
    socket.current.emit("to-device", {message: "pause_screen"});
    socket.current.emit("to-device", {message: "pause_webcam"});
    socket.current.emit("to-device", {message: "pause_audio"});
    }
  }, [socket?.current]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isFileCard = event.target.closest('[data-file-card]');
      if (containerRef.current && containerRef.current.contains(event.target) && !isFileCard
        && !optionsRef.current.contains(event.target)) {
        setSelectedFiles([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSelectedFiles]);

  useEffect(() => {
    if(!tcpDataChannel) return;
    if (tcpDataChannel.readyState !== "open") return
    tcpDataChannel.send(JSON.stringify({type: "get_files", path: currentFilePath}));
  }, [tcpDataChannel]);

  function getCurrentFiles() {
    let current = files;
    for (const key of currentFilePath) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return [];
      }
    }
    return Object.entries(current)
      .filter(([key]) => !key.startsWith('*'))
      .map(([name, value]) => ({
        name,
        type: value["*type"] || "unknown",
        size: value["*size"] || null
      }));
  }

  function handleFileDoubleClick(item) {
    if (!tcpDataChannel) {
      toast.error("Device is not connected", {
        description: "Please connect to the device first."})
      return;
    }
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    setSelectedFiles([]);
    if (item.type === "directory") {
      if (!hasSubdirectories(files, [...currentFilePath, item.name])) {
        setIsRefreshing(true);
        tcpDataChannel?.send(JSON.stringify({type: "get_files", path: [...currentFilePath, item.name]}));
        setCurrentFilePath([...currentFilePath, item.name]);
      } else {
        setCurrentFilePath([...currentFilePath, item.name]);
      }
    } else {
      console.log(`Opening file: ${item.name}`);
    }
  }

  function handleFileClick(e, item) {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    clickTimer.current = setTimeout(() => {
      if (e.ctrlKey) {
        if (selectedFiles.includes(item.name)) {
          setSelectedFiles(selectedFiles.filter(file => file !== item.name));
        } else {
          setSelectedFiles([...selectedFiles, item.name]);
        }
      } else {
        setSelectedFiles([item.name]);
      }
      clickTimer.current = null;
    }, 250);
    
  }
  
  const currentFiles = getCurrentFiles();
  return (
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0" ref={containerRef}>
      <div className="text-white text-3xl font-bold mb-2">
        File Manager
      </div>
      <div ref={optionsRef}>
        <OptionsBar />
      </div>
      <NavigationBar/>
      <div className="w-full h-[1px] bg-dark-4"></div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div
          className="grid gap-4 pt-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 280px))",
            justifyContent: "start"
          }}
        >
          {currentFiles.map((item) => {
            const isSelected = selectedFiles.includes(item.name);
            const FileIcon = fileIcons[item.type] || fileIcons["default"];
            return (<div data-file-card className={`flex max-w-80 items-center border-none ${isSelected ? "bg-purple-1/50" : "bg-dark-3"}
             border-[1px] overflow-hidden rounded-2xl p-2 gap-3 active:scale-95 transition-all duration-200 ${!isSelected && "hover:bg-dark-4"}`}
              key={[...currentFilePath, item.name]} onDoubleClick={() => handleFileDoubleClick(item)}
               onClick={(e) => {handleFileClick(e, item)}}>
              <FileIcon className="w-12 h-12 text-white/85"/>
              <div className="flex-1 min-w-0">
                <p className="text-white cursor-default select-none text-md font-medium opacity-90 truncate ">{item.name}</p>
                <p className="text-gray-400 cursor-default selet-none text-sm">{item.size}</p>
              </div>
            </div>)
          })}
          {currentFiles.length === 0 && (
            <p>No files found in this directory</p>
          )}
          { isDownloading && ( 
            <div className="flex flex-col w-80 h-30 rounded-t-xl bg-dark-3 border-dark-4 border-[1px] fixed bottom-1 right-1 rounded-md">
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-t-xl">
                  <div className="font-medium text-white/80">
                    {
                    (downloadProgress > 0) ?
                    <p className="font-medium text-white/80">
                      Downloading
                      <span className="text-white/80 text-sm">({downloadedFileSize + " / " + downloadFileSize})</span>
                    </p>  
                    :"Preparing for download..."
                    }
                  </div>
                  <RxCross2 onClick={() => {
                    setIsDownloading(false);
                    setNumDownloadingFiles(0);
                    if (window.zipDownload) {
                      delete window.zipDownload;
                    }
                    tcpDataChannel?.send(JSON.stringify({type: "cancel_download"}));
                  }}
                  className="w-6 h-6 hover:bg-white/10 font-sans text-white/50 hover:text-white cursor-pointer p-1 rounded-full"/>
                </div>
              <div className="flex flex-1 flex-col items-center">
                <div className="flex justify-between w-full items-center p-1 py-2">
                  <p className="cursor-default text-md text-white/80 pl-1">{downloadProgress}%</p>
                  <ProgressBar completed={downloadProgress} height={"10px"} width="265px" customLabel=" "
                  bgColor="#E6E6E6" baseBgColor="#333333"/>
                </div>
                <div className="flex items-center w-full h-full justify-start pl-2">
                  <p className="cursor-default text-white/80">Selected {numDownloadingFiles} files</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default FilePage