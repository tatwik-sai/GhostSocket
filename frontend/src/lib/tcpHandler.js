import { useFileStore } from "@/store/slices/ActiveConnection/FileSlice";


const {addFilesToPath} = useFileStore()

export const handleTcpMessages = (message) => {
    console.log("📨 Received from TCP channel:", message);
    
    if (message.type === "get_files_response") {
        addFilesToPath(message.path , message.files);
    }
}