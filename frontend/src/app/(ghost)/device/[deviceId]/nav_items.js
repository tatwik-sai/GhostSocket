import { SlGraph } from "react-icons/sl";
import { RiTerminalBoxFill, RiComputerFill } from "react-icons/ri";
import { FaCamera } from "react-icons/fa";
import { MdDashboard} from "react-icons/md";
import { IoMdFolder } from "react-icons/io";


export const navItems = [
    {   
        id: "profile",
        name: "Profile",
        href: "/device-profile",
        icon: MdDashboard, 
    },
    {
        id: "fileAccess",
        name: "File Manager",
        href: "/files",
        icon: IoMdFolder, 
    },
    {
        id: "terminalAccess",
        name: "Terminal",
        href: "/terminal",
        icon: RiTerminalBoxFill, 
    },
    {   
        id: "remoteControl",
        name: "Remote Controller",
        href: "/remote-control",
        icon: RiComputerFill, 
    },
    
    {
        id: "webcamFeed",
        name: "Webcam Feed",
        href: "/webcam-feed",
        icon: FaCamera, 
    },
    {
        id: "resourceMonitor",
        name: "Resource Monitor",
        href: "/resource-monitor",
        icon: SlGraph, 
    },
]