import { SlGraph } from "react-icons/sl";
import { RiComputerLine, RiCameraLine, RiTerminalBoxFill, RiComputerFill } from "react-icons/ri";
import { FaCamera } from "react-icons/fa";
import { MdDashboard} from "react-icons/md";
import { IoMdFolder } from "react-icons/io";


export const navItems = [
    {
        name: "Profile",
        href: "/device-profile",
        icon: MdDashboard, 
    },
    {
        name: "File Manager",
        href: "/files",
        icon: IoMdFolder, 
    },
    {
        name: "Terminal",
        href: "/terminal",
        icon: RiTerminalBoxFill, 
    },
    {
        name: "Screen Stream",
        href: "/screen-share",
        icon: RiComputerFill, 
    },
    
    {
        name: "Webcam Feed",
        href: "/webcam-feed",
        icon: FaCamera, 
    },
    {
        name: "Resource Monitor",
        href: "/resource-monitor",
        icon: SlGraph, 
    },
]